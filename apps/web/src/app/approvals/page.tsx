"use client";

import { useState, useEffect } from "react";
import { ApprovalItem } from "@/lib/lifeops-store";

export default function ApprovalsPage() {
    const defaultApprovals: ApprovalItem[] = [
        {
            id: "appr_1",
            title: "Authorize $89.00 Internet Bill Auto-Pay",
            vendor: "Fiber Telecom Services",
            amount: "$89.00",
            category: "Utilities",
            status: "Pending",
            date: "Sep 12, 2026",
        },
        {
            id: "appr_2",
            title: "Review $240.00 SaaS Subscription Renewal",
            vendor: "Cloud SaaS Inc.",
            amount: "$240.00",
            category: "Software",
            status: "Pending",
            date: "Sep 08, 2026",
        },
    ];

    const [approvals, setApprovals] = useState<ApprovalItem[]>(defaultApprovals);

    useEffect(() => {
        try {
            const custom = localStorage.getItem("lifeops_approvals");
            if (custom) {
                const userApprovals: ApprovalItem[] = JSON.parse(custom);
                setApprovals([...userApprovals, ...defaultApprovals]);
            }
        } catch (e) {
            console.error("Failed to load approvals", e);
        }
    }, []);

    const handleAction = (id: string, action: "Approved" | "Rejected") => {
        setApprovals((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: action } : item))
        );
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                    Governance Desk
                </span>
                <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                    Pending Approvals
                </h1>
                <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                    Human-in-the-loop decisions for automated payment authorizations and high-risk actions.
                </p>
            </div>

            <div className="space-y-3">
                {approvals.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        <div className="space-y-1">
                            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#F2E9DD]">
                                {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#D1C7BD]/70">
                                <span className="px-2 py-0.5 rounded bg-[#1A1512] border border-[#F2E9DD]/10 text-[#E0924A]">
                                    {item.category}
                                </span>
                                <span>•</span>
                                <span>Vendor: {item.vendor}</span>
                                <span>•</span>
                                <span>{item.date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2E9DD]/10 shrink-0">
                            <span className="font-mono text-sm font-bold text-[#F2E9DD] mr-2">
                                {item.amount}
                            </span>

                            {item.status === "Pending" ? (
                                <>
                                    <button
                                        onClick={() => handleAction(item.id, "Approved")}
                                        className="px-3 py-1.5 rounded-lg bg-[#33513F] text-[#6B9080] hover:bg-[#3d614b] text-xs font-mono font-bold cursor-pointer transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(item.id, "Rejected")}
                                        className="px-3 py-1.5 rounded-lg bg-[#C1442E]/20 text-[#C1442E] hover:bg-[#C1442E]/30 text-xs font-mono font-bold cursor-pointer transition-colors"
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : (
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${item.status === "Approved"
                                            ? "bg-[#33513F]/40 text-[#6B9080]"
                                            : "bg-[#C1442E]/20 text-[#C1442E]"
                                        }`}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}