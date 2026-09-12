"use client";

import { useEffect, useState } from "react";

type Approval = {
    approval_id: string;
    summary: string;
    details: string;
    risk_level: string;
    status: string;
};

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    function load() {
        fetch("http://localhost:8000/approvals")
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                return res.json();
            })
            .then(setApprovals)
            .catch((err) => setError(err.message));
    }

    useEffect(load, []);

    async function handleDecision(id: string, decision: "approve" | "reject") {
        setBusyId(id);
        try {
            await fetch(`http://localhost:8000/approvals/${id}/${decision}`, {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_LIFEOPS_API_KEY || "" },
            });
            load();
        } finally {
            setBusyId(null);
        }
    }

    if (error) return <main className="max-w-2xl mx-auto px-8 py-10 text-stamp">{error}</main>;
    if (!approvals) return <main className="max-w-2xl mx-auto px-8 py-10 text-ink/50">Loading...</main>;

    const pending = approvals.filter((a) => a.status === "pending");
    const resolved = approvals.filter((a) => a.status !== "pending");

    return (
        <main className="max-w-4xl px-8 py-10">
            <h1 className="font-display italic text-5xl font-light text-ink mb-10">Approvals</h1>

            <h2 className="text-sm font-medium text-ink/60 mb-3">Needs your decision</h2>
            {pending.length === 0 ? (
                <p className="text-sm text-ink/50 mb-10">Nothing waiting on you.</p>
            ) : (
                <div className="space-y-3 mb-10">
                    {pending.map((a) => (
                        <div key={a.approval_id} className="rounded-2xl bg-ink/5 p-5 shadow-[0_8px_30px_rgba(224,146,74,0.10)]">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <p className="text-sm text-ink">{a.summary}</p>
                                <span className="text-xs text-stamp bg-stamp/10 px-2 py-1 rounded-full whitespace-nowrap">
                                    {a.risk_level} risk
                                </span>
                            </div>
                            <p className="text-sm text-ink/60 mb-4">{a.details}</p>
                            <div className="flex gap-3">
                                <button
                                    disabled={busyId === a.approval_id}
                                    onClick={() => handleDecision(a.approval_id, "approve")}
                                    className="text-sm px-4 py-2 rounded-full bg-ledger text-paper disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    disabled={busyId === a.approval_id}
                                    onClick={() => handleDecision(a.approval_id, "reject")}
                                    className="text-sm px-4 py-2 rounded-full bg-stamp text-paper disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {resolved.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-ink/60 mb-3">Past decisions</h2>
                    <div className="border-t border-ink/10">
                        {resolved.map((a) => (
                            <div key={a.approval_id} className="flex justify-between items-center py-3 border-b border-ink/10">
                                <span className="text-sm text-ink/70">{a.summary}</span>
                                <span className={`text-xs ${a.status === "approved" ? "text-ledger" : "text-ink/40"}`}>
                                    {a.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}