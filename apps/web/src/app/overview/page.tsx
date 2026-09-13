"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function OverviewPage() {
    const { data: session } = useSession();

    const userName = session?.user?.name || "Operator";

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            {/* Welcome Banner */}
            <div className="mb-6 sm:mb-10 pb-6 border-b border-[#F2E9DD]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                        Personal Operations Center
                    </span>
                    <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2E9DD] tracking-tight">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1.5 font-sans max-w-2xl">
                        Autonomous agent strands are actively monitoring your incoming invoices, governance obligations, and calendar syncs.
                    </p>
                </div>

                {/* Action Button Group */}
                <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 w-full sm:w-auto">
                    <Link
                        href="/upload"
                        className="flex-1 sm:flex-initial text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] border border-[#1A1512] hover:bg-[#d4843c] transition-all shadow-sm"
                    >
                        + Ingest Document
                    </Link>
                    <Link
                        href="/approvals"
                        className="flex-1 sm:flex-initial text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-[#2A231F] text-[#F2E9DD] border border-[#F2E9DD]/20 hover:bg-[#382F2A] transition-all"
                    >
                        Review Approvals (1)
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Bar (Responsive Grid: 1 col on mobile -> 2 col on tablet -> 4 col on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Metric 1 */}
                <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D1C7BD] mb-2">
                        <span>Pending Tasks</span>
                        <span className="text-[#E0924A] font-bold">&bull; Active</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F2E9DD]">04</div>
                    <p className="text-[11px] text-[#D1C7BD]/70 font-mono mt-1">2 due within 48h</p>
                </div>

                {/* Metric 2 */}
                <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D1C7BD] mb-2">
                        <span>Requires Action</span>
                        <span className="text-[#C1442E] font-bold">&bull; Priority</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F2E9DD]">01</div>
                    <p className="text-[11px] text-[#D1C7BD]/70 font-mono mt-1">Utility Payment Approval</p>
                </div>

                {/* Metric 3 */}
                <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D1C7BD] mb-2">
                        <span>Ingested Docs</span>
                        <span className="text-[#6B9080] font-bold">&check; Synced</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F2E9DD]">18</div>
                    <p className="text-[11px] text-[#D1C7BD]/70 font-mono mt-1">Last parsed 3h ago</p>
                </div>

                {/* Metric 4 */}
                <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D1C7BD] mb-2">
                        <span>Agent Memory</span>
                        <span className="text-[#6B9080] font-bold">&bull; Online</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F2E9DD]">142</div>
                    <p className="text-[11px] text-[#D1C7BD]/70 font-mono mt-1">Isolated memory facts</p>
                </div>
            </div>

            {/* Main Content Grid (Main Feed vs Sidebar: Stack on mobile, 3-column layout on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Left 2 Columns: Priority Obligations & Activity Feed */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Urgent Approval Banner */}
                    <div className="rounded-3xl bg-[#2A231F] border border-[#E0924A]/40 p-5 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E0924A]/20 text-[#E0924A] text-[10px] font-mono font-bold uppercase">
                                    Action Required
                                </span>
                                <h3 className="font-serif italic text-xl font-bold text-[#F2E9DD] pt-1">
                                    Authorize Internet Bill Auto-Pay ($89.00)
                                </h3>
                                <p className="text-xs text-[#D1C7BD] font-sans">
                                    Parsed from incoming PDF receipt: Fiber Telecom Services Inc.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0 w-full sm:w-auto">
                                <Link
                                    href="/approvals"
                                    className="w-full sm:w-auto text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] hover:bg-[#d4843c] transition-colors"
                                >
                                    Review Request &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pending Tasks Feed Card */}
                    <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-5 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2E9DD]/10">
                            <h3 className="font-serif italic text-xl font-bold text-[#F2E9DD]">
                                Active Obligations
                            </h3>
                            <Link href="/tasks" className="text-xs font-mono text-[#E0924A] hover:underline">
                                View All (4) &rarr;
                            </Link>
                        </div>

                        <div className="space-y-3 font-mono text-xs">
                            {/* Task 1 */}
                            <div className="p-3.5 rounded-2xl bg-[#1A1512] border border-[#F2E9DD]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <p className="text-[#F2E9DD] font-bold font-sans text-sm">
                                        Schedule Dental Annual Checkup
                                    </p>
                                    <span className="text-[11px] text-[#D1C7BD]/60">Source: Health Memory Context</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-[#382F2A] text-[#E0924A] text-[10px] font-bold self-start sm:self-auto">
                                    Due Tomorrow
                                </span>
                            </div>

                            {/* Task 2 */}
                            <div className="p-3.5 rounded-2xl bg-[#1A1512] border border-[#F2E9DD]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <p className="text-[#F2E9DD] font-bold font-sans text-sm">
                                        Renew Vehicle Registration
                                    </p>
                                    <span className="text-[11px] text-[#D1C7BD]/60">Source: Uploaded PDF Log</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-[#382F2A] text-[#D1C7BD] text-[10px] font-bold self-start sm:self-auto">
                                    Due in 5 Days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Agent Memory Telemetry & System Status */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-5 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#6B9080] animate-pulse" />
                            <h3 className="font-serif italic text-lg font-bold text-[#F2E9DD]">
                                Live Agent Memory
                            </h3>
                        </div>

                        <p className="text-xs text-[#D1C7BD] leading-relaxed mb-4 font-sans">
                            Autonomous Strands continuously aggregate data points to preempt missed deadlines and duplicate transactions.
                        </p>

                        <div className="space-y-2.5 font-mono text-[11px]">
                            <div className="p-3 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 text-[#D1C7BD]">
                                <strong className="text-[#6B9080] block mb-0.5">&bull; Memory Indexed</strong>
                                <span>Internet provider changed billing day from 15th to 18th.</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 text-[#D1C7BD]">
                                <strong className="text-[#E0924A] block mb-0.5">&bull; Verification Scoped</strong>
                                <span>Matching receipt hash with monthly bank statement logs.</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#F2E9DD]/10">
                            <Link
                                href="/activity"
                                className="text-xs font-mono text-[#D1C7BD]/70 hover:text-[#F2E9DD] flex items-center justify-between"
                            >
                                <span>View Full Audit Trail</span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}