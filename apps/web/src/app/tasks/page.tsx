"use client";

import { useState, useEffect } from "react";
import { TaskItem } from "@/lib/lifeops-store";

export default function TasksPage() {
  const defaultTasks: TaskItem[] = [
    {
      id: "task_1",
      title: "Renew vehicle registration notice",
      dueDate: "Sep 20, 2026",
      priority: "High",
      status: "Pending",
    },
    {
      id: "task_2",
      title: "Schedule annual dental checkup",
      dueDate: "Tomorrow",
      priority: "Medium",
      status: "Pending",
    },
  ];

  const [tasks, setTasks] = useState<TaskItem[]>(defaultTasks);

  useEffect(() => {
    try {
      const custom = localStorage.getItem("lifeops_tasks");
      if (custom) {
        const userTasks: TaskItem[] = JSON.parse(custom);
        setTasks([...userTasks, ...defaultTasks]);
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Pending" ? "Completed" : "Pending" }
          : t
      )
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
      <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
          Execution Queue
        </span>
        <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
          Active Task Obligations
        </h1>
        <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
          Tracked tasks derived from parsed documents, user requests, and background scheduling.
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.status === "Completed"}
                onChange={() => toggleTask(task.id)}
                className="w-4 h-4 accent-[#E0924A] cursor-pointer"
              />
              <div>
                <h3
                  className={`font-mono text-xs sm:text-sm font-bold ${task.status === "Completed"
                      ? "line-through text-[#D1C7BD]/40"
                      : "text-[#F2E9DD]"
                    }`}
                >
                  {task.title}
                </h3>
                <span className="text-[11px] font-mono text-[#D1C7BD]/60">
                  Due: {task.dueDate}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${task.priority === "High"
                  ? "bg-[#C1442E]/20 text-[#C1442E] border border-[#C1442E]/40"
                  : "bg-[#E0924A]/20 text-[#E0924A] border border-[#E0924A]/40"
                }`}
            >
              {task.priority} Priority
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}