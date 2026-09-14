"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchActivity, ActivityItem } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "text-ledger bg-ledger/10 border-ledger/20",
    approved: "text-ledger bg-ledger/10 border-ledger/20",
    pending: "text-kraft bg-kraft/10 border-kraft/20",
    rejected: "text-stamp bg-stamp/10 border-stamp/20",
  };
  return (
    <span
      className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${styles[status] ?? "text-ink/50 bg-ink/5 border-ink/10"
        }`}
    >
      {status}
    </span>
  );
}

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "action" | "approval">("all");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetchActivity()
      .then((data) => {
        let localActivities: ActivityItem[] = [];
        try {
          const stored = localStorage.getItem("lifeops_activities");
          if (stored) {
            localActivities = JSON.parse(stored);
          }
        } catch (e) {
          console.error("Failed to parse local activities", e);
        }

        // Combine custom local activities with backend activities
        setItems([...localActivities, ...(data || [])]);
        setError(null);
      })
      .catch((err) => {
        // Fallback to local storage if API fails
        try {
          const stored = localStorage.getItem("lifeops_activities");
          if (stored) {
            setItems(JSON.parse(stored));
            setError(null);
            return;
          }
        } catch (e) {
          console.error("Failed to read local fallback", e);
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const matchesFilter = filter === "all" ? true : item.kind === filter;
      const matchesSearch =
        search.trim() === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.detail.toLowerCase().includes(search.toLowerCase()) ||
        (item.tool && item.tool.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display italic text-5xl font-light text-ink">Audit Trail</h1>
          <p className="text-sm text-ink/60 mt-1">
            Immutable operational ledger of autonomous actions, verifications, and approvals
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs px-3.5 py-1.5 rounded-full bg-ink/5 hover:bg-ink/10 text-ink/70 border border-ink/10 transition-colors font-mono self-start sm:self-auto"
        >
          Refresh Ledger
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-1.5 p-1 rounded-xl bg-ink/5 border border-ink/10 self-start">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${filter === "all" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
          >
            All Events ({(items || []).length})
          </button>
          <button
            onClick={() => setFilter("action")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${filter === "action" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
          >
            Autonomous Actions
          </button>
          <button
            onClick={() => setFilter("approval")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${filter === "approval" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
          >
            Human Approvals
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-ink/5 border border-ink/10 text-ink placeholder:text-ink/30 focus:outline-none focus:border-kraft/50 transition-colors"
          />
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 rounded-2xl bg-ink/5" />
          <div className="h-20 rounded-2xl bg-ink/5" />
          <div className="h-20 rounded-2xl bg-ink/5" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-stamp/10 border border-stamp/20 p-5 text-sm text-stamp">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-12 text-center">
          <p className="text-sm text-ink/60 mb-2">No activity records match your criteria.</p>
          <Link href="/upload" className="text-xs text-kraft hover:underline font-mono">
            Process a document to generate new audit events &rarr;
          </Link>
        </div>
      ) : (
        <div className="relative pl-6 border-l border-ink/15 space-y-6">
          {filtered.map((item) => {
            const isApproval = item.kind === "approval";
            const isVerified = Boolean(item.verified_at);

            return (
              <div key={`${item.kind}-${item.id}`} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-paper transition-transform group-hover:scale-125 ${isApproval
                      ? "border-stamp bg-stamp/20"
                      : isVerified
                        ? "border-ledger bg-ledger/20"
                        : "border-kraft bg-kraft/20"
                    }`}
                />

                <div className="rounded-2xl bg-ink/5 border border-ink/10 p-5 hover:border-ink/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ink/10 text-ink/60">
                          {item.kind}
                        </span>
                        {item.tool && (
                          <span className="text-[10px] font-mono text-kraft">
                            tool: {item.tool}
                          </span>
                        )}
                        {item.risk_level && (
                          <span className="text-[10px] font-mono text-stamp uppercase">
                            {item.risk_level} risk
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-xs text-ink/70 leading-relaxed font-mono bg-paper/40 rounded-xl p-3 my-3 border border-ink/5">
                    {item.detail}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink/40 font-mono pt-1">
                    <span>Logged: {item.created_at}</span>
                    {isVerified && (
                      <span className="text-ledger font-medium flex items-center gap-1">
                        <span>&check;</span>
                        <span>Verified by AgentCore at {item.verified_at}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}