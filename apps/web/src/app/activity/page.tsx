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

function StatusTag({ status }: { status: string }) {
    const styles: Record<string, string> = {
        completed: "text-ledger bg-ledger/10",
        approved: "text-ledger bg-ledger/10",
        pending: "text-kraft bg-kraft/10",
        rejected: "text-ink/50 bg-ink/5",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${styles[status] ?? "text-ink/50 bg-ink/5"}`}>
            {status}
        </span>
    );
}

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

    if (error) return <main className="max-w-4xl px-8 py-14 text-stamp">{error}</main>;
    if (!items) return <main className="max-w-4xl px-8 py-14 text-ink/50">Loading...</main>;

    return (
        <main className="max-w-4xl px-8 py-14">
            <h1 className="font-display italic text-5xl font-light text-ink mb-10">Activity</h1>

            {items.length === 0 ? (
                <p className="text-sm text-ink/50">Nothing has happened yet.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={`${item.kind}-${item.id}`} className="rounded-2xl bg-ink/5 p-5">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <p className="text-ink">{item.title}</p>
                                <StatusTag status={item.status} />
                            </div>
                            <p className="text-sm text-ink/60 mb-2">{item.detail}</p>
                            <p className="text-xs text-ink/40 font-mono">{item.created_at}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}