"use client";

import { useState } from "react";
import Link from "next/link";

interface DocumentItem {
    id: string;
    name: string;
    category: string;
    date: string;
    size: string;
    status: "Verified" | "Parsing" | "Flagged";
}

export default function DocumentsPage() {
    const [search, setSearch] = useState("");

    const docs: DocumentItem[] = [
        {
            id: "doc_1",
            name: "Fiber_Telecom_Invoice_Sep2026.pdf",
            category: "Utilities",
            date: "Sep 12, 2026",
            size: "1.2 MB",
            status: "Verified",
        },
        {
            id: "doc_2",
            name: "Vehicle_Registration_Notice.pdf",
            category: "Automotive",
            date: "Sep 10, 2026",
            size: "840 KB",
            status: "Verified",
        },
        {
            id: "doc_3",
            name: "Cloud_SaaS_Renewal_Statement.pdf",
            category: "Software",
            date: "Sep 08, 2026",
            size: "2.1 MB",
            status: "Flagged",
        },
    ];

    const filteredDocs = docs.filter(
        (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            {/* Header */}
            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                        Verified Archives
                    </span>
                    <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                        Ingested Documents
                    </h1>
                    <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                        Cryptographically indexed receipts, statements, and policy documents.
                    </p>
                </div>

                <Link
                    href="/upload"
                    className="w-full sm:w-auto text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] hover:bg-[#d4843c] transition-colors shrink-0"
                >
                    + Upload New Document
                </Link>
            </div>

            {/* Search Input */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Filter documents by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-md px-4 py-2.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/20 text-[#F2E9DD] placeholder:text-[#D1C7BD]/40 text-xs focus:outline-none focus:border-[#E0924A] transition-colors"
                />
            </div>

            {/* Document Items List */}
            <div className="space-y-3">
                {filteredDocs.map((doc) => (
                    <div
                        key={doc.id}
                        className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        <div className="space-y-1">
                            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#F2E9DD] break-all">
                                {doc.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#D1C7BD]/70">
                                <span className="px-2 py-0.5 rounded bg-[#1A1512] border border-[#F2E9DD]/10 text-[#E0924A]">
                                    {doc.category}
                                </span>
                                <span>&bull;</span>
                                <span>{doc.date}</span>
                                <span>&bull;</span>
                                <span>{doc.size}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2E9DD]/10 shrink-0">
                            <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${doc.status === "Verified"
                                        ? "bg-[#33513F]/40 text-[#6B9080] border border-[#33513F]"
                                        : "bg-[#C1442E]/20 text-[#C1442E] border border-[#C1442E]/40"
                                    }`}
                            >
                                {doc.status}
                            </span>

                            <button
                                type="button"
                                className="text-xs font-mono text-[#E0924A] hover:underline cursor-pointer shrink-0"
                            >
                                Inspect Data &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}