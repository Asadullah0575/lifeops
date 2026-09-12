"use client";

import { useEffect, useState } from "react";

type Task = {
    task_id: string;
    title: string;
    due_date: string;
    priority: string;
    status: string;
};

type Approval = {
    approval_id: string;
    summary: string;
    risk_level: string;
};

type OverviewData = {
    open_task_count: number;
    pending_approval_count: number;
    recent_tasks: Task[];
    pending_approvals: Approval[];
};

export default function OverviewPage() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/overview")
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <main className="max-w-2xl mx-auto px-8 py-10 text-stamp">{error}</main>;
    if (!data) return <main className="max-w-2xl mx-auto px-8 py-10 text-ink/50">Loading...</main>;

    return (
        <main className="max-w-2xl mx-auto px-8 py-14">
            <h1 className="font-display italic text-5xl font-light text-ink mb-10">Overview</h1>

            <div className="flex gap-4 mb-12">
                <div className="rounded-2xl bg-ink/5 px-6 py-5">
                    <p className="text-4xl font-mono text-kraft">{data.open_task_count}</p>
                    <p className="text-sm text-ink/60 mt-1">Open tasks</p>
                </div>
                <div className="rounded-2xl bg-ink/5 px-6 py-5">
                    <p className={`text-4xl font-mono ${data.pending_approval_count > 0 ? "text-stamp" : "text-ink"}`}>
                        {data.pending_approval_count}
                    </p>
                    <p className="text-sm text-ink/60 mt-1">Pending approvals</p>
                </div>
            </div>

            {data.pending_approvals.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-sm font-medium text-ink/60 mb-4">Needs your approval</h2>
                    <div className="space-y-3">
                        {data.pending_approvals.map((a) => (
                            <div
                                key={a.approval_id}
                                className="rounded-2xl bg-ink/5 p-5 shadow-[0_8px_30px_rgba(224,146,74,0.12)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm text-ink">{a.summary}</p>
                                    <span className="text-xs text-stamp bg-stamp/10 px-2 py-1 rounded-full whitespace-nowrap">
                                        {a.risk_level} risk
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-sm font-medium text-ink/60 mb-4">Upcoming</h2>
                {data.recent_tasks.length === 0 ? (
                    <p className="text-sm text-ink/50">Nothing due yet.</p>
                ) : (
                    <div className="border-t border-ink/10">
                        {data.recent_tasks.map((t) => (
                            <div key={t.task_id} className="flex items-center justify-between py-4 border-b border-ink/10">
                                <span className="text-sm text-ink">{t.title}</span>
                                <span className="text-sm text-ink/50 font-mono">{t.due_date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}