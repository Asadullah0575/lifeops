"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApprovals, submitApprovalDecision, Approval } from "@/lib/api";

function RiskPill({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    high: "text-stamp bg-stamp/15 border-stamp/30",
    medium: "text-kraft bg-kraft/15 border-kraft/30",
    low: "text-ledger bg-ledger/15 border-ledger/30",
  };
  return (
    <span
      className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border ${
        styles[risk] ?? "text-ink/60 bg-ink/5 border-ink/10"
      }`}
    >
      {risk} risk
    </span>
  );
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchApprovals()
      .then((items) => {
        setApprovals(items);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    try {
      await submitApprovalDecision(id, decision);
      setToast(`Decision recorded: ${decision === "approve" ? "Approved" : "Rejected"}`);
      setTimeout(() => setToast(null), 3000);
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to record decision");
    } finally {
      setBusyId(null);
    }
  }

  const pending = (approvals || []).filter((a) => a.status === "pending");
  const resolved = (approvals || []).filter((a) => a.status !== "pending");

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display italic text-5xl font-light text-ink">Governance & Approvals</h1>
        <p className="text-sm text-ink/60 mt-1">
          LifeOps autonomous boundary: high-impact financial or irreversible actions wait for your review.
        </p>
      </div>

      {toast && (
        <div className="mb-6 rounded-xl bg-ledger/10 border border-ledger/30 text-ledger px-4 py-2.5 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* Governance Philosophy Callout */}
      <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 mb-10 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-kraft/15 text-kraft flex items-center justify-center font-mono text-sm shrink-0">
          !
        </div>
        <div className="text-xs text-ink/70 leading-relaxed">
          <p className="font-medium text-ink mb-1">Human-in-the-Loop Governance Active</p>
          <p>
            When documents contain clauses such as cancellation fees, refund deadlines, payments, or
            account deletions, the Verification Agent intercepts the automated loop. Execution is paused
            and stored as an approval request until you choose to authorize or dismiss it.
          </p>
        </div>
      </div>

      {/* Pending Items */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase font-mono text-ink/70 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                pending.length > 0 ? "bg-stamp" : "bg-ledger"
              }`}
            />
            Awaiting Decision ({pending.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-28 rounded-2xl bg-ink/5" />
            <div className="h-28 rounded-2xl bg-ink/5" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-stamp/10 border border-stamp/20 p-5 text-sm text-stamp">
            {error}
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl bg-ink/5 border border-ink/10 p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-ledger/10 text-ledger flex items-center justify-center mx-auto mb-3 font-bold text-sm">
              &check;
            </div>
            <p className="text-sm text-ink font-medium mb-1">Zero pending approvals</p>
            <p className="text-xs text-ink/50 max-w-sm mx-auto">
              All automated actions are operating within safe parameters. No high-risk actions are queued.
            </p>
            <Link
              href="/upload"
              className="inline-block mt-4 text-xs text-kraft hover:underline font-mono"
            >
              Test with High-Risk Scenario &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((a) => (
              <div
                key={a.approval_id}
                className="rounded-2xl bg-ink/5 border border-stamp/30 p-6 shadow-[0_8px_30px_rgba(193,68,46,0.08)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-ink/40 block mb-1">
                      ID: {a.approval_id}
                    </span>
                    <p className="text-sm font-medium text-ink leading-snug">{a.summary}</p>
                  </div>
                  <RiskPill risk={a.risk_level} />
                </div>

                <div className="rounded-xl bg-paper/60 border border-ink/10 p-3.5 mb-4 text-xs text-ink/70 leading-relaxed font-mono">
                  {a.details}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    disabled={busyId === a.approval_id}
                    onClick={() => handleDecision(a.approval_id, "approve")}
                    className="text-xs px-5 py-2 rounded-full bg-ledger hover:bg-ledger/90 text-paper font-medium transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {busyId === a.approval_id ? "Executing..." : "Authorize & Proceed"}
                  </button>
                  <button
                    disabled={busyId === a.approval_id}
                    onClick={() => handleDecision(a.approval_id, "reject")}
                    className="text-xs px-5 py-2 rounded-full bg-stamp hover:bg-stamp/90 text-paper font-medium transition-colors disabled:opacity-50"
                  >
                    Dismiss & Reject
                  </button>
                  <span className="text-[11px] font-mono text-ink/40 ml-auto">
                    Action halted until confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resolved Decisions */}
      {resolved.length > 0 && (
        <section>
          <h2 className="text-sm font-medium tracking-wide uppercase font-mono text-ink/60 mb-4">
            Past Human Decisions ({resolved.length})
          </h2>
          <div className="rounded-2xl bg-ink/5 border border-ink/10 divide-y divide-ink/10 overflow-hidden">
            {resolved.map((a) => (
              <div
                key={a.approval_id}
                className="flex items-center justify-between p-4 text-xs"
              >
                <div>
                  <span className="text-ink/80 block font-medium">{a.summary}</span>
                  <span className="text-[10px] text-ink/40 font-mono">
                    ID: {a.approval_id.slice(0, 16)}...
                  </span>
                </div>
                <span
                  className={`font-mono uppercase text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    a.status === "approved"
                      ? "text-ledger bg-ledger/10 border border-ledger/20"
                      : "text-stamp bg-stamp/10 border border-stamp/20"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}