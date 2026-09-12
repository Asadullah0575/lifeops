"use client";

import { useState, useRef } from "react";

type DocumentFacts = Record<string, string>;

type UploadResult = {
    document_id: string;
    facts: DocumentFacts;
    result: string;
};

export default function UploadPage() {
    const [result, setResult] = useState<UploadResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        setFileName(file.name);
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/upload", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_LIFEOPS_API_KEY || "" },
                body: formData,
            });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            const data: UploadResult = await res.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-4xl px-8 py-14">
            <h1 className="font-display italic text-5xl font-light text-ink mb-3">Upload a document</h1>
            <p className="text-sm text-ink/60 mb-10">
                Receipts, appointment confirmations, or anything with a date LifeOps should track.
            </p>

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                }}
                className="border-2 border-dashed border-ink/20 rounded-2xl p-12 text-center cursor-pointer hover:border-ink/40 hover:bg-ink/5 transition-colors mb-6"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
                <p className="text-sm text-ink/70">
                    {fileName ? fileName : "Click to choose a file, or drag one here"}
                </p>
                <p className="text-xs text-ink/40 mt-1">.txt files, up to 10MB</p>
            </div>

            {loading && (
                <div className="rounded-2xl bg-ink/5 p-4 flex items-center gap-3 text-sm text-ink/60 mb-6">
                    <span className="h-2 w-2 rounded-full bg-kraft animate-pulse" />
                    Processing document...
                </div>
            )}

            {error && (
                <div className="rounded-2xl bg-stamp/10 p-4 text-sm text-stamp mb-6">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    <div className="rounded-2xl bg-ink/5 p-5">
                        <p className="text-xs text-ink/40 mb-3">Document ID: {result.document_id}</p>
                        {Object.entries(result.facts).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-ink/10 last:border-b-0 py-2 text-sm">
                                <span className="text-ink/60 capitalize">{key.replace(/_/g, " ")}</span>
                                <span className="text-ink text-right">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl bg-ink/5 p-5 shadow-[0_8px_30px_rgba(224,146,74,0.10)]">
                        <p className="text-sm text-ink/60 mb-2">What LifeOps did</p>
                        <p className="text-sm text-ink whitespace-pre-wrap">{result.result}</p>
                    </div>
                </div>
            )}
        </main>
    );
}