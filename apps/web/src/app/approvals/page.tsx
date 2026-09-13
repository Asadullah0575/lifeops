"use client";

import { useState } from "react";
import Link from "next/link";

interface ApprovalRequest {
    id: string;
    title: string;
    vendor: string;
    amount: string;
    dueDate: string;
    riskLevel: "Low Risk" | "Requires Verification" | "Urgent";
    description: string;
    status: "pending" | "approved" | "rejected";
}

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([
        {
            id: "app_1",
            title: "Authorize Internet Bill Auto-Pay",
            vendor: "Fiber Telecom Services Inc.",
            amount: "$89.00",
            dueDate: "Due Sep 16, 2026",
            riskLevel: "Low Risk",
            description: "Amount matches prior 3 billing cycles. No rate increases detected.",
            status: "pending",
        },
        {
            id: "app_2",
            title: "Unusual Software Subscription Renewal",
            vendor: "Cloud Analytics SaaS",
            amount: "$240.00",
            dueDate: "Due Sep 18, 2026",
            riskLevel: "Requires Verification",
            description: "Amount increased by $40 compared to prior quarter statement.",
            status: "pending",
        },
    ]);

    const handleDecision = (id: string, decision: "approved" | "rejected") => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
        );
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            {/* Header */}
            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                        Governance Gate
                    </span>
                    <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                        Pending Agent Approvals
                    </h1>
                    <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                        Autonomous agent strands require explicit human verification before initiating monetary or legal actions.
                    </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/15 text-xs font-mono text-[#D1C7BD] flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#E0924A] animate-pulse" />
                    <span>{requests.filter((r) => r.status === "pending").length} Pending Gate Decisions</span>
                </div>
            </div>

            {/* Approvals Cards Grid */}
            <div className="space-y-4">
                {requests.map((item) => (
                    <div
                        key={item.id}
                        className={`rounded-3xl bg-[#2A231F] border p-5 sm:p-6 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] ${item.status !== "pending"
                                ? "border-[#F2E9DD]/10 opacity-60"
                                : "border-[#F2E9DD]/20"
                            }`}
                    >
                        {/* Top Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${item.riskLevel === "Low Risk"
                                            ? "bg-[#33513F]/40 text-[#6B9080] border border-[#33513F]"
                                            : "bg-[#E0924A]/20 text-[#E0924A] border border-[#E0924A]/40"
                                        }`}
                                >
                                    {item.riskLevel}
                                </span>
                                <span className="text-xs font-mono text-[#D1C7BD]/60">{item.dueDate}</span>
                            </div>

                            {item.status !== "pending" && (
                                <span
                                    className={`text-xs font-mono font-bold capitalize ${item.status === "approved" ? "text-[#6B9080]" : "text-[#C1442E]"
                                        }`}
                                >
                                    &bull; {item.status}
                                </span>
                            )}
                        </div>

                        {/* Title & Vendor Details */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="font-serif italic text-xl font-bold text-[#F2E9DD]">
                                    {item.title}
                                </h3>
                                <p className="text-xs font-mono text-[#D1C7BD] mt-0.5">
                                    Vendor: <strong className="text-[#F2E9DD]">{item.vendor}</strong>
                                </p>
                            </div>

                            <div className="text-left md:text-right shrink-0">
                                <span className="text-[10px] font-mono uppercase text-[#D1C7BD]/60 block">Amount</span>
                                <span className="text-2xl font-mono font-bold text-[#E0924A]">{item.amount}</span>
                            </div>
                        </div>

                        {/* Description / Reasoning Callout */}
                        <div className="rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 p-3.5 mb-5 text-xs text-[#D1C7BD] font-sans">
                            <strong className="text-[#F2E9DD] font-mono block mb-0.5">Agent Context Reasoning:</strong>
                            {item.description}
                        </div>

                        {/* Action Buttons Container (inline-flex & shrink-0 bound) */}
                        {item.status === "pending" ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#F2E9DD]/10">
                                <button
                                    type="button"
                                    onClick={() => handleDecision(item.id, "rejected")}
                                    className="px-4 py-2.5 rounded-xl bg-[#1A1512] border border-[#C1442E]/50 text-[#C1442E] font-bold text-xs hover:bg-[#C1442E]/10 transition-all cursor-pointer text-center"
                                >
                                    Reject Action
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDecision(item.id, "approved")}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] font-bold text-xs hover:bg-[#d4843c] transition-all cursor-pointer shadow-sm text-center shrink-0"
                                >
                                    <span>Authorize & Exec</span>
                                    <span className="font-mono font-bold leading-none">&rarr;</span>
                                </button>
                            </div>
                        ) : (
                            <div className="pt-3 border-t border-[#F2E9DD]/10 text-right text-xs font-mono text-[#D1C7BD]/50">
                                Decision logged to cryptographic audit stream
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}