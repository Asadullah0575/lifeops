"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  uploadDocument,
  uploadText,
  loadDemoSample,
  fetchSamples,
  DemoSample,
  UploadResult,
  FALLBACK_SAMPLES,
} from "@/lib/api";

const STEPS = [
  "Detecting document & uploading to S3...",
  "Classifying type & extracting structured facts...",
  "Evaluating obligations, return windows & risk...",
  "Executing autonomous actions & committing to AgentCore...",
];

export default function UploadPage() {
  const [samples, setSamples] = useState<DemoSample[]>(FALLBACK_SAMPLES);
  const [inputMode, setInputMode] = useState<"presets" | "file" | "text">("presets");
  const [pastedText, setPastedText] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSamples().then((data) => {
      if (data && data.length > 0) setSamples(data);
    });
  }, []);

  // Animate loading step while processing
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleFile(file: File) {
    setFileName(file.name);
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);

    try {
      const data = await uploadDocument(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSampleClick(sample: DemoSample) {
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);
    setFileName(sample.filename);

    try {
      const data = await loadDemoSample(sample.id);
      setResult(data);
    } catch (err) {
      // If server sample route fails, fallback to uploading text directly
      try {
        const data = await uploadText(sample.content, sample.filename);
        setResult(data);
      } catch (err2) {
        setError(err2 instanceof Error ? err2.message : "Sample load failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleTextSubmit() {
    if (!pastedText.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);
    setFileName("pasted_document.txt");

    try {
      const data = await uploadText(pastedText, "pasted_document.txt");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Text processing failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display italic text-5xl font-light text-ink">Ingest Document</h1>
        <p className="text-sm text-ink/60 mt-1">
          Receipts, appointments, or policies with obligations for LifeOps to autonomously track.
        </p>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex gap-2 mb-6 border-b border-ink/10 pb-4">
        <button
          onClick={() => setInputMode("presets")}
          className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
            inputMode === "presets"
              ? "bg-kraft text-paper shadow-sm"
              : "bg-ink/5 text-ink/70 hover:text-ink"
          }`}
        >
          Quick Demo Presets
        </button>
        <button
          onClick={() => setInputMode("file")}
          className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
            inputMode === "file"
              ? "bg-kraft text-paper shadow-sm"
              : "bg-ink/5 text-ink/70 hover:text-ink"
          }`}
        >
          Upload Local File
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
            inputMode === "text"
              ? "bg-kraft text-paper shadow-sm"
              : "bg-ink/5 text-ink/70 hover:text-ink"
          }`}
        >
          Paste Raw Text
        </button>
      </div>

      {/* Presets Mode */}
      {inputMode === "presets" && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-ink/50">
              Select a Hackathon Demonstration Scenario:
            </span>
            <span className="text-[11px] font-mono text-kraft">1-Click Execution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {samples.map((s) => (
              <div
                key={s.id}
                onClick={() => !loading && handleSampleClick(s)}
                className={`rounded-2xl border p-5 text-left transition-all cursor-pointer group flex flex-col justify-between ${
                  loading
                    ? "opacity-50 pointer-events-none"
                    : "bg-ink/5 hover:bg-ink/[0.08] hover:border-kraft/40 hover:shadow-[0_8px_30px_rgba(224,146,74,0.08)] border-ink/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-ink group-hover:text-kraft transition-colors">
                      {s.title}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-ink/10 text-ink/60 border border-ink/10 mb-2">
                    {s.badge}
                  </span>
                  <p className="text-xs text-ink/50 leading-relaxed mb-4">{s.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-ink/10 text-xs text-kraft">
                  <span className="font-mono text-[11px]">{s.filename}</span>
                  <span className="group-hover:translate-x-1 transition-transform font-bold">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Mode */}
      {inputMode === "file" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="border-2 border-dashed border-ink/20 rounded-3xl p-12 text-center cursor-pointer hover:border-kraft/40 hover:bg-ink/5 transition-all mb-8"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".txt,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="w-10 h-10 rounded-full bg-kraft/10 text-kraft flex items-center justify-center mx-auto mb-3 font-mono text-base">
            &uarr;
          </div>
          <p className="text-sm text-ink font-medium">
            {fileName ? fileName : "Click to select a document, or drop file here"}
          </p>
          <p className="text-xs text-ink/40 mt-1.5 font-mono">
            Accepts .txt (order receipts, medical confirmations, booking emails)
          </p>
        </div>
      )}

      {/* Direct Text Paste Mode */}
      {inputMode === "text" && (
        <div className="mb-8 space-y-3">
          <textarea
            rows={7}
            placeholder="Paste text from receipt, email confirmation, or appointment notice..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="w-full text-xs font-mono p-4 rounded-2xl bg-ink/5 border border-ink/10 text-ink placeholder:text-ink/30 focus:outline-none focus:border-kraft/50 transition-colors"
          />
          <div className="flex justify-end">
            <button
              disabled={loading || !pastedText.trim()}
              onClick={handleTextSubmit}
              className="text-xs px-5 py-2.5 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors disabled:opacity-50"
            >
              Parse & Run Agent Loop &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {loading && (
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-6 mb-8 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-kraft animate-pulse" />
            <span className="text-sm font-medium text-ink font-mono">
              LifeOps Autonomous Agent Running
            </span>
          </div>
          <p className="text-xs text-kraft/80 font-mono transition-all">
            &gt; {STEPS[loadingStep]}
          </p>
          <div className="w-full bg-ink/10 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-kraft h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl bg-stamp/10 border border-stamp/20 p-5 text-sm text-stamp mb-8">
          <p className="font-semibold mb-1">Execution Interrupted</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
      )}

      {/* Execution Result */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-ledger/20 text-ledger border border-ledger/30 font-semibold">
                Processed & Verified
              </span>
              <span className="text-xs font-mono text-ink/40">
                id: {result.document_id}
              </span>
            </div>
            <Link href="/overview" className="text-xs text-kraft hover:underline font-mono">
              View on Operations Desk &rarr;
            </Link>
          </div>

          {/* Facts Grid */}
          <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5">
            <p className="text-xs uppercase font-mono tracking-wider text-ink/40 mb-3">
              Extracted Structured Facts (Research Agent)
            </p>
            <div className="divide-y divide-ink/10 text-xs">
              {Object.entries(result.facts).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2.5 gap-4">
                  <span className="text-ink/60 capitalize font-mono">{key.replace(/_/g, " ")}</span>
                  <span className="text-ink font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Outcomes */}
          <div className="rounded-2xl bg-ink/5 border border-kraft/30 p-5 shadow-[0_8px_30px_rgba(224,146,74,0.08)]">
            <p className="text-xs uppercase font-mono tracking-wider text-kraft mb-2 font-bold">
              Autonomous Actions & Safety Decisions
            </p>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed font-mono text-xs">
              {result.result}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}