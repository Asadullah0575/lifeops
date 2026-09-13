"use client";

import { useState } from "react";
import Link from "next/link";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  source: string;
  status: "pending" | "completed";
}

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "tsk_1",
      title: "Schedule Dental Annual Checkup",
      category: "Health & Wellness",
      dueDate: "Tomorrow",
      source: "Health Context Memory",
      status: "pending",
    },
    {
      id: "tsk_2",
      title: "Renew Vehicle Registration",
      category: "Automotive",
      dueDate: "In 5 Days",
      source: "Uploaded PDF Log",
      status: "pending",
    },
    {
      id: "tsk_3",
      title: "Confirm Home Insurance Renewal Rate",
      category: "Finance",
      dueDate: "Sep 20, 2026",
      source: "Policy Statement",
      status: "pending",
    },
    {
      id: "tsk_4",
      title: "Submit Expense Report for Q3 Software Tools",
      category: "Operations",
      dueDate: "Completed Today",
      source: "Receipt Ingestion",
      status: "completed",
    },
  ]);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
          : t
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
      {/* Header Bar */}
      <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
            Obligation Tracker
          </span>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
            Pending Tasks & Action Items
          </h1>
          <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
            Tasks automatically extracted from parsed documents, emails, and active agent memory.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/15 self-start sm:self-auto shrink-0 w-full sm:w-auto overflow-x-auto">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer whitespace-nowrap ${filter === tab
                  ? "bg-[#E0924A] text-[#1A1512] font-bold"
                  : "text-[#D1C7BD]/70 hover:text-[#F2E9DD]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/10 p-6">
            <p className="text-sm font-mono text-[#D1C7BD]">No tasks found under this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl bg-[#2A231F] border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${task.status === "completed"
                  ? "border-[#F2E9DD]/10 opacity-60"
                  : "border-[#F2E9DD]/15 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                }`}
            >
              {/* Task Details */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  aria-label={`Mark ${task.title} as ${task.status === "completed" ? "pending" : "completed"}`}
                  className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${task.status === "completed"
                      ? "bg-[#6B9080] border-[#6B9080] text-[#1A1512]"
                      : "border-[#F2E9DD]/30 hover:border-[#E0924A] bg-[#1A1512]"
                    }`}
                >
                  {task.status === "completed" && (
                    <svg
                      className="w-3.5 h-3.5 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3.5"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>

                <div className="space-y-1">
                  <h3
                    className={`font-sans text-sm font-semibold text-[#F2E9DD] ${task.status === "completed" ? "line-through text-[#D1C7BD]/60" : ""
                      }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#D1C7BD]/70">
                    <span className="px-2 py-0.5 rounded bg-[#1A1512] border border-[#F2E9DD]/10">
                      {task.category}
                    </span>
                    <span>&bull;</span>
                    <span>{task.source}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2E9DD]/10 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${task.status === "completed"
                      ? "bg-[#33513F]/40 text-[#6B9080]"
                      : task.dueDate.includes("Tomorrow")
                        ? "bg-[#E0924A]/20 text-[#E0924A]"
                        : "bg-[#382F2A] text-[#D1C7BD]"
                    }`}
                >
                  {task.dueDate}
                </span>

                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="text-xs font-mono text-[#E0924A] hover:underline cursor-pointer shrink-0"
                >
                  {task.status === "completed" ? "Reopen" : "Mark Done"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}