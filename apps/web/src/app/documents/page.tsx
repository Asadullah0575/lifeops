"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchDocuments,
  Document,
  ReceiptDocument,
  AppointmentDocument,
} from "@/lib/api";

function TypeTag({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-kraft/15 text-kraft border border-kraft/20 whitespace-nowrap">
      {label}
    </span>
  );
}

function ReceiptCard({ d }: { d: ReceiptDocument }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 hover:border-ink/20 transition-all">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-base font-medium text-ink">{d.product}</p>
          <p className="text-xs text-ink/50 mt-0.5">
            {d.retailer} &middot; Purchased {d.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-ink/5 text-ink border border-ink/10">
            {d.amount}
          </span>
          <TypeTag label="receipt" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-ink/10 text-xs text-ink/70 font-mono">
        <div>
          <span className="text-ink/40 block text-[10px] uppercase">Return Window</span>
          <span>{d.deadline}</span>
        </div>
        <div>
          <span className="text-ink/40 block text-[10px] uppercase">Manufacturer Warranty</span>
          <span>{d.warranty}</span>
        </div>
      </div>

      <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-ink/40">
        <span>Doc ID: {d.document_id.slice(0, 16)}...</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-kraft hover:underline"
        >
          {expanded ? "Hide raw metadata" : "Inspect metadata &rarr;"}
        </button>
      </div>

      {expanded && (
        <pre className="mt-3 p-3 rounded-xl bg-paper border border-ink/10 text-[11px] font-mono text-ink/70 overflow-x-auto">
          {JSON.stringify(d, null, 2)}
        </pre>
      )}
    </div>
  );
}

function AppointmentCard({ d }: { d: AppointmentDocument }) {
  const [expanded, setExpanded] = useState(false);
  const hasFee = (d.cancellation_policy || "").toLowerCase().includes("fee");

  return (
    <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 hover:border-ink/20 transition-all">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-base font-medium text-ink">{d.appointment_type}</p>
          <p className="text-xs text-ink/50 mt-0.5">
            {d.provider} &middot; {d.date} at <span className="font-mono text-ink/80">{d.time}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFee && (
            <span className="text-[10px] font-mono text-stamp bg-stamp/15 border border-stamp/20 px-2 py-0.5 rounded-full uppercase">
              Fee Clause
            </span>
          )}
          <TypeTag label="appointment" />
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-3 border-t border-ink/10 text-xs text-ink/70">
        <p className="font-mono">
          <span className="text-ink/40 text-[10px] uppercase block">Location</span>
          {d.location}
        </p>
        {d.prep_instructions && d.prep_instructions !== "not present" && (
          <p className="font-mono">
            <span className="text-ink/40 text-[10px] uppercase block">Preparation</span>
            {d.prep_instructions}
          </p>
        )}
        {d.cancellation_policy && d.cancellation_policy !== "not present" && (
          <p className="font-mono text-stamp/90">
            <span className="text-stamp/60 text-[10px] uppercase block">Cancellation Terms</span>
            {d.cancellation_policy}
          </p>
        )}
      </div>

      <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-ink/40">
        <span>Doc ID: {d.document_id.slice(0, 16)}...</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-kraft hover:underline"
        >
          {expanded ? "Hide raw metadata" : "Inspect metadata &rarr;"}
        </button>
      </div>

      {expanded && (
        <pre className="mt-3 p-3 rounded-xl bg-paper border border-ink/10 text-[11px] font-mono text-ink/70 overflow-x-auto">
          {JSON.stringify(d, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "receipt" | "appointment">("all");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetchDocuments()
      .then((items) => {
        setDocuments(items);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter((d) => {
      const type = d.document_type || "receipt";
      const matchesType = filterType === "all" ? true : type === filterType;

      const fullText = JSON.stringify(d).toLowerCase();
      const matchesSearch = search.trim() === "" || fullText.includes(search.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [documents, filterType, search]);

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display italic text-5xl font-light text-ink">Document Archives</h1>
          <p className="text-sm text-ink/60 mt-1">
            Raw files stored in S3 and parsed by the Strands Research Agent into structured operations
          </p>
        </div>
        <Link
          href="/upload"
          className="text-xs px-4 py-2 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          + Ingest New
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-1.5 p-1 rounded-xl bg-ink/5 border border-ink/10 self-start">
          <button
            onClick={() => setFilterType("all")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterType === "all" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            All Docs ({(documents || []).length})
          </button>
          <button
            onClick={() => setFilterType("receipt")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterType === "receipt" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setFilterType("appointment")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterType === "appointment" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            Appointments
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search documents or retailer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-ink/5 border border-ink/10 text-ink placeholder:text-ink/30 focus:outline-none focus:border-kraft/50 transition-colors"
          />
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 rounded-2xl bg-ink/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-ink/5 animate-pulse" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-stamp/10 border border-stamp/20 p-5 text-sm text-stamp">
          {error}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-12 text-center">
          <p className="text-sm text-ink/60 mb-2">No documents processed yet.</p>
          <Link href="/upload" className="text-xs text-kraft hover:underline font-mono">
            Ingest your first document or test sample &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((d) =>
            d.document_type === "appointment" ? (
              <AppointmentCard key={d.document_id} d={d as AppointmentDocument} />
            ) : (
              <ReceiptCard key={d.document_id} d={d as ReceiptDocument} />
            )
          )}
        </div>
      )}
    </main>
  );
}