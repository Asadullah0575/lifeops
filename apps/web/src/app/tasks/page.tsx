"use client";

import { useEffect, useState } from "react";

type Task = {
  task_id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
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

  if (error) return <main className="max-w-2xl mx-auto px-8 py-10 text-stamp">{error}</main>;
  if (!tasks) return <main className="max-w-2xl mx-auto px-8 py-10 text-ink/50">Loading...</main>;

  return (
    <main className="max-w-4xl px-8 py-10">
      <h1 className="font-display italic text-5xl font-light text-ink mb-3">Tasks</h1>
      <p className="text-sm text-ink/60 mb-10">{tasks.length} open</p>
      {tasks.length === 0 ? (
        <p className="text-sm text-ink/50">Nothing open right now.</p>
      ) : (
        <div className="border-t border-ink/10">
          {tasks.map((t) => (
            <div key={t.task_id} className="flex items-center justify-between py-4 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <p className="text-ink">{t.title}</p>
                <span className="text-xs text-ink/50 bg-ink/5 px-2 py-1 rounded-full">{t.priority}</span>
              </div>
              <p className="font-mono text-sm text-ink/60">{t.due_date}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}