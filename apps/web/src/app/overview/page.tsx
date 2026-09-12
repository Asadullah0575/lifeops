"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchOverview,
  completeTask,
  submitApprovalDecision,
  fetchMemories,
  OverviewData,
} from "@/lib/api";

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    Promise.all([fetchOverview(), fetchMemories()])
      .then(([overviewData, memoryList]) => {
        setData(overviewData);
        setMemories(memoryList);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleQuickDecision(approvalId: string, decision: "approve" | "reject") {
    setActionBusyId(approvalId);
    try {
      await submitApprovalDecision(approvalId, decision);
      setNotice(`Approval successfully marked as ${decision}d.`);
      setTimeout(() => setNotice(null), 4000);
      loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to record decision");
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleTaskToggle(taskId: string) {
    setActionBusyId(taskId);
    try {
      await completeTask(taskId);
      setNotice("Task marked as completed.");
      setTimeout(() => setNotice(null), 4000);
      loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to complete task");
    } finally {
      setActionBusyId(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display italic text-5xl font-light text-ink">Operations Desk</h1>
          <p className="text-sm text-ink/60 mt-1">
            Autonomous status, active obligations, and governance gates
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/upload"
            className="text-xs px-4 py-2 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors shadow-sm"
          >
            + Upload Document
          </Link>
          <Link
            href="/activity"
            className="text-xs px-4 py-2 rounded-full bg-ink/5 hover:bg-ink/10 text-ink border border-ink/10 transition-colors"
          >
            Audit Trail &rarr;
          </Link>
        </div>
      </div>

      {notice && (
        <div className="mb-8 rounded-xl bg-ledger/10 border border-ledger/30 text-ledger px-4 py-3 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs opacity-60 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5">
          <p className="text-xs uppercase tracking-wider font-mono text-ink/50 mb-1">Open Obligations</p>
          <p className="text-4xl font-mono text-kraft">
            {loading ? <span className="opacity-30">--</span> : data?.open_task_count ?? 0}
          </p>
          <p className="text-xs text-ink/40 mt-2">Active tasks requiring tracking</p>
        </div>

        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5">
          <p className="text-xs uppercase tracking-wider font-mono text-ink/50 mb-1">Human Approvals</p>
          <p
            className={`text-4xl font-mono ${
              (data?.pending_approval_count ?? 0) > 0 ? "text-stamp font-bold" : "text-ink"
            }`}
          >
            {loading ? <span className="opacity-30">--</span> : data?.pending_approval_count ?? 0}
          </p>
          <p className="text-xs text-ink/40 mt-2">High-risk actions awaiting decision</p>
        </div>

        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5">
          <p className="text-xs uppercase tracking-wider font-mono text-ink/50 mb-1">Agent Memory</p>
          <p className="text-4xl font-mono text-ledger">
            {loading ? <span className="opacity-30">--</span> : memories.length}
          </p>
          <p className="text-xs text-ink/40 mt-2">Persisted facts in AgentCore</p>
        </div>
      </div>

      {/* Pending Approvals (Human-in-the-Loop) */}
      {(data?.pending_approvals ?? []).length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium tracking-wide uppercase font-mono text-stamp flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stamp" />
              Governance Gate &middot; Needs Your Decision
            </h2>
            <Link href="/approvals" className="text-xs text-ink/50 hover:text-ink">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.pending_approvals.map((a) => (
              <div
                key={a.approval_id}
                className="rounded-2xl bg-ink/5 border border-stamp/30 p-5 shadow-[0_8px_30px_rgba(193,68,46,0.08)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-ink leading-snug">{a.summary}</p>
                    {a.details && a.details !== a.summary && (
                      <p className="text-xs text-ink/60 mt-1.5">{a.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-stamp bg-stamp/10 border border-stamp/20 px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                    {a.risk_level} risk
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-ink/10">
                  <button
                    disabled={actionBusyId === a.approval_id}
                    onClick={() => handleQuickDecision(a.approval_id, "approve")}
                    className="text-xs px-4 py-1.5 rounded-full bg-ledger hover:bg-ledger/90 text-paper font-medium transition-colors disabled:opacity-50"
                  >
                    {actionBusyId === a.approval_id ? "Processing..." : "Approve Action"}
                  </button>
                  <button
                    disabled={actionBusyId === a.approval_id}
                    onClick={() => handleQuickDecision(a.approval_id, "reject")}
                    className="text-xs px-4 py-1.5 rounded-full bg-stamp hover:bg-stamp/90 text-paper font-medium transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <span className="text-[11px] text-ink/40 ml-auto font-mono">
                    Agent execution paused
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Obligations & Tasks */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase font-mono text-ink/60">
            Upcoming Obligations
          </h2>
          <Link href="/tasks" className="text-xs text-ink/50 hover:text-ink">
            Manage tasks &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-12 rounded-xl bg-ink/5" />
            <div className="h-12 rounded-xl bg-ink/5" />
          </div>
        ) : (data?.recent_tasks ?? []).length === 0 ? (
          <div className="rounded-2xl bg-ink/5 border border-ink/10 p-8 text-center">
            <p className="text-sm text-ink/60 mb-2">No open tasks right now.</p>
            <Link
              href="/upload"
              className="text-xs text-kraft hover:underline"
            >
              Upload a receipt or appointment to see autonomous extraction in action.
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-ink/5 border border-ink/10 divide-y divide-ink/10 overflow-hidden">
            {data?.recent_tasks.map((t) => (
              <div
                key={t.task_id}
                className="flex items-center justify-between p-4 hover:bg-ink/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    disabled={actionBusyId === t.task_id}
                    onClick={() => handleTaskToggle(t.task_id)}
                    title="Mark task complete"
                    className="w-5 h-5 rounded border border-ink/30 hover:border-kraft flex items-center justify-center transition-colors text-kraft text-xs"
                  >
                    {actionBusyId === t.task_id ? "..." : ""}
                  </button>
                  <div>
                    <span className="text-sm text-ink block font-medium">{t.title}</span>
                    <span className="text-[11px] text-ink/40 capitalize">{t.priority} priority</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-ink/5 text-ink/70">
                    {t.due_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AgentCore Long-Term Memory Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase font-mono text-ink/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ledger" />
            AgentCore Memory &middot; Context Retained
          </h2>
          <span className="text-xs text-ink/40 font-mono">Persistent</span>
        </div>

        {memories.length === 0 ? (
          <p className="text-xs text-ink/40">No memories stored yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memories.slice(0, 4).map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-ink/5 border border-ink/10 p-3.5 text-xs text-ink/70 leading-relaxed font-mono"
              >
                <span className="text-kraft font-semibold mr-1">&bull;</span>
                {m}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}