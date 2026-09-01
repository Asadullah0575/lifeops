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

    if (error) return <main className="p-8 text-red-600">{error}</main>;
    if (!data) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="text-2xl font-semibold">Overview</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Open tasks</p>
                    <p className="text-3xl font-semibold">{data.open_task_count}</p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Pending approvals</p>
                    <p className="text-3xl font-semibold">{data.pending_approval_count}</p>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-medium mb-3">Upcoming</h2>
                {data.recent_tasks.length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing due yet.</p>
                ) : (
                    <div className="space-y-2">
                        {data.recent_tasks.map((t) => (
                            <div key={t.task_id} className="border rounded-lg p-3 flex justify-between">
                                <span>{t.title}</span>
                                <span className="text-sm text-gray-500">{t.due_date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {data.pending_approvals.length > 0 && (
                <div>
                    <h2 className="text-lg font-medium mb-3">Needs your approval</h2>
                    <div className="space-y-2">
                        {data.pending_approvals.map((a) => (
                            <div key={a.approval_id} className="border rounded-lg p-3 bg-amber-50">
                                <p>{a.summary}</p>
                                <p className="text-sm text-gray-500">Risk: {a.risk_level}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}