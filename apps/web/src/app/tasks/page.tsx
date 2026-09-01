"use client";

import { useEffect, useState } from "react";

type Task = {
  task_id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
  source_id: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/tasks")
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(setTasks)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!tasks) return <main className="p-8">Loading...</main>;

  const priorityColor: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No open tasks.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.task_id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-500">Due {t.due_date}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${priorityColor[t.priority] ?? "bg-gray-100 text-gray-600"}`}
              >
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}