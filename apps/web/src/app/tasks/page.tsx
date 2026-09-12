"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchTasks, completeTask, Task } from "@/lib/api";

function formatRelativeDue(dueDateStr: string): { label: string; urgent: boolean } {
  if (!dueDateStr) return { label: "No deadline", urgent: false };
  const target = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, urgent: true };
  }
  if (diffDays === 0) {
    return { label: "Due today", urgent: true };
  }
  if (diffDays === 1) {
    return { label: "Due tomorrow", urgent: false };
  }
  return { label: `In ${diffDays} days`, urgent: false };
}

function PriorityTag({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "text-stamp bg-stamp/10 border-stamp/30",
    medium: "text-kraft bg-kraft/10 border-kraft/30",
    low: "text-ledger bg-ledger/10 border-ledger/30",
  };
  return (
    <span
      className={`text-[11px] font-mono capitalize px-2 py-0.5 rounded-full border ${
        styles[priority] ?? "text-ink/50 bg-ink/5 border-ink/10"
      }`}
    >
      {priority}
    </span>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"open" | "complete" | "all">("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchTasks()
      .then((items) => {
        setTasks(items);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleComplete(task: Task) {
    if (task.status === "complete") return; // already completed
    setCompletingId(task.task_id);

    // Optimistic UI update
    setTasks((prev) =>
      (prev || []).map((t) =>
        t.task_id === task.task_id ? { ...t, status: "complete" } : t
      )
    );

    try {
      await completeTask(task.task_id);
      setToastMessage(`Completed: "${task.title}"`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Failed to complete task");
      load(); // rollback
    } finally {
      setCompletingId(null);
    }
  }

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "open"
          ? t.status === "open"
          : t.status === "complete";
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.priority.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [tasks, activeTab, searchQuery]);

  const openCount = (tasks || []).filter((t) => t.status === "open").length;
  const completedCount = (tasks || []).filter((t) => t.status === "complete").length;

  return (
    <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display italic text-5xl font-light text-ink">Obligations & Tasks</h1>
          <p className="text-sm text-ink/60 mt-1">
            Autonomously created from receipts, appointment confirmations, and policies
          </p>
        </div>
        <Link
          href="/upload"
          className="text-xs px-4 py-2 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          + Ingest New Document
        </Link>
      </div>

      {toastMessage && (
        <div className="mb-6 rounded-xl bg-ledger/10 border border-ledger/30 text-ledger px-4 py-2.5 text-xs flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-60 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Tab Filters */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-ink/5 border border-ink/10 self-start">
          <button
            onClick={() => setActiveTab("open")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === "open" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            <span>Open</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-kraft/15 text-kraft">
              {openCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("complete")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === "complete" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            <span>Completed</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-ledger/15 text-ledger">
              {completedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === "all" ? "bg-paper text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            All ({(tasks || []).length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search tasks or priority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-ink/5 border border-ink/10 text-ink placeholder:text-ink/30 focus:outline-none focus:border-kraft/50 transition-colors"
          />
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-16 rounded-2xl bg-ink/5" />
          <div className="h-16 rounded-2xl bg-ink/5" />
          <div className="h-16 rounded-2xl bg-ink/5" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-stamp/10 border border-stamp/20 p-6 text-sm text-stamp">
          <p className="font-medium mb-1">Could not fetch tasks from server</p>
          <p className="text-xs opacity-80">{error}</p>
          <button onClick={load} className="mt-3 text-xs underline">
            Try again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-12 text-center">
          <p className="text-sm text-ink/60 mb-2">
            {searchQuery
              ? "No tasks match your search filter."
              : activeTab === "open"
              ? "All caught up! No open tasks."
              : "No completed tasks yet."}
          </p>
          <Link href="/upload" className="text-xs text-kraft hover:underline">
            Upload another document to generate obligations &rarr;
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-ink/5 border border-ink/10 divide-y divide-ink/10 overflow-hidden">
          {filteredTasks.map((t) => {
            const isDone = t.status === "complete";
            const rel = formatRelativeDue(t.due_date);
            return (
              <div
                key={t.task_id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 transition-colors ${
                  isDone ? "opacity-50 bg-ink/[0.01]" : "hover:bg-ink/[0.02]"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button
                    disabled={isDone || completingId === t.task_id}
                    onClick={() => handleToggleComplete(t)}
                    title={isDone ? "Completed" : "Click to mark complete"}
                    className={`w-5 h-5 rounded mt-0.5 sm:mt-0 flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-ledger border border-ledger text-paper font-bold text-xs"
                        : "border border-ink/30 hover:border-kraft hover:scale-105"
                    }`}
                  >
                    {isDone ? "\u2713" : completingId === t.task_id ? "..." : ""}
                  </button>

                  <div>
                    <p className={`text-sm font-medium text-ink ${isDone ? "line-through text-ink/50" : ""}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityTag priority={t.priority} />
                      {t.source_id && (
                        <span className="text-[11px] text-ink/40 font-mono">
                          source: {t.source_id.slice(0, 14)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center ml-8 sm:ml-0">
                  {rel.urgent && !isDone && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stamp/20 text-stamp font-medium">
                      {rel.label}
                    </span>
                  )}
                  {!rel.urgent && !isDone && (
                    <span className="text-[11px] font-mono text-ink/40">
                      {rel.label}
                    </span>
                  )}
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-ink/5 text-ink/70 border border-ink/5">
                    {t.due_date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}