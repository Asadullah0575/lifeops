"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
    kind: "action" | "approval";
    id: string;
    title: string;
    detail: string;
    status: string;
    created_at: string;
    risk_level?: string;
};

export default function ActivityPage() {
    const [items, setItems] = useState<ActivityItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/activity")
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                return res.json();
            })
            .then(setItems)
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <main className="p-8 text-red-600">{error}</main>;
    if (!items) return <main className="p-8">Loading...</main>;

    const statusColor: Record<string, string> = {
        completed: "bg-green-100 text-green-700",
        approved: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        rejected: "bg-gray-100 text-gray-600",
    };

    return (
        <main className="max-w-3xl mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-6">Activity</h1>

            {items.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing has happened yet.</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={`${item.kind}-${item.id}`} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-medium">{item.title}</p>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${statusColor[item.status] ?? "bg-gray-100 text-gray-600"}`}
                                >
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{item.detail}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.created_at}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}