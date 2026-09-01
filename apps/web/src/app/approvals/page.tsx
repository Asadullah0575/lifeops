"use client";

import { useEffect, useState } from "react";

type Approval = {
    approval_id: string;
    summary: string;
    details: string;
    risk_level: string;
    status: string;
    action_type: string;
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
            await fetch(`http://localhost:8000/approvals/${id}/${decision}`, { method: "POST" });
            load();
        } finally {
            setBusyId(null);
        }
    }

    if (error) return <main className="p-8 text-red-600">{error}</main>;
    if (!approvals) return <main className="p-8">Loading...</main>;

    const pending = approvals.filter((a) => a.status === "pending");
    const resolved = approvals.filter((a) => a.status !== "pending");

    return (
        <main className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="text-2xl font-semibold">Approvals</h1>

            <div>
                <h2 className="text-lg font-medium mb-3">Needs your decision</h2>
                {pending.length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing waiting on you.</p>
                ) : (
                    <div className="space-y-3">
                        {pending.map((a) => (
                            <div key={a.approval_id} className="border rounded-lg p-4 bg-amber-50">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium">{a.summary}</p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                        {a.risk_level} risk
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{a.details}</p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={busyId === a.approval_id}
                                        onClick={() => handleDecision(a.approval_id, "approve")}
                                        className="text-sm px-3 py-1.5 rounded-md bg-green-600 text-white disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        disabled={busyId === a.approval_id}
                                        onClick={() => handleDecision(a.approval_id, "reject")}
                                        className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {resolved.length > 0 && (
                <div>
                    <h2 className="text-lg font-medium mb-3">Past decisions</h2>
                    <div className="space-y-2">
                        {resolved.map((a) => (
                            <div key={a.approval_id} className="border rounded-lg p-3 flex justify-between items-center">
                                <span className="text-sm">{a.summary}</span>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${a.status === "approved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                        }`}
                                >
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