"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ingestDocumentRecord } from "@/lib/lifeops-store";

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const processUpload = (name: string, size: string, category: string) => {
        setIsUploading(true);
        setFileName(name);

        setTimeout(() => {
            ingestDocumentRecord(name, category, size);
            setIsUploading(false);
            setUploadSuccess(true);
        }, 1200);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const category = file.name.endsWith(".pdf") ? "Invoice" : "General";
            processUpload(file.name, formatFileSize(file.size), category);
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                className="hidden"
            />

            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                    Ingestion Portal
                </span>
                <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                    Upload Document or Receipt
                </h1>
                <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                    Documents uploaded here are automatically parsed into active memory, generating corresponding approval items, tasks, and activity logs.
                </p>
            </div>

            <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
                {uploadSuccess ? (
                    <div className="space-y-6 py-4">
                        <div className="w-12 h-12 rounded-full bg-[#33513F]/40 border border-[#6B9080] text-[#6B9080] flex items-center justify-center mx-auto text-xl font-bold">
                            ✓
                        </div>
                        <div>
                            <h3 className="font-serif italic text-2xl font-bold text-[#F2E9DD]">
                                Document Ingested & Synchronized
                            </h3>
                            <p className="text-xs font-mono text-[#D1C7BD] mt-2">
                                Successfully processed <span className="text-[#E0924A] font-bold">{fileName}</span>. Created corresponding entries in Approvals, Tasks, and Activity.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setUploadSuccess(false);
                                    setFileName("");
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/20 text-xs font-bold hover:bg-[#382F2A] transition-colors cursor-pointer"
                            >
                                Upload Another
                            </button>
                            <Link
                                href="/documents"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/20 text-xs font-bold hover:bg-[#382F2A] transition-colors"
                            >
                                View Documents
                            </Link>
                            <Link
                                href="/approvals"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] text-xs font-bold hover:bg-[#d4843c] transition-colors"
                            >
                                View Approvals &rarr;
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-[#F2E9DD]/20 hover:border-[#E0924A] rounded-2xl p-8 transition-colors cursor-pointer bg-[#1A1512]/50 block text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#2A231F] border border-[#F2E9DD]/15 flex items-center justify-center mx-auto text-[#E0924A] text-xl font-bold mb-3 pointer-events-none">
                                ↑
                            </div>
                            <p className="text-sm font-semibold text-[#F2E9DD] pointer-events-none">
                                Tap or click here to choose a file from your device
                            </p>
                            <p className="text-xs font-mono text-[#D1C7BD]/60 mt-1 pointer-events-none">
                                Supports PDF, PNG, JPG, TXT up to 25MB
                            </p>
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-[#F2E9DD]/10"></div>
                            <span className="flex-shrink mx-4 text-[10px] font-mono text-[#D1C7BD]/40 uppercase">Or test ingestion</span>
                            <div className="flex-grow border-t border-[#F2E9DD]/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => processUpload(`Invoice_Telecom_Sep2026_${Math.floor(Math.random() * 1000)}.pdf`, "1.4 MB", "Utilities")}
                            disabled={isUploading}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E0924A] text-[#1A1512] font-bold text-xs hover:bg-[#d4843c] transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {isUploading ? (
                                <span className="font-mono">Parsing Document & Generating System State...</span>
                            ) : (
                                <span>Simulate Document Ingestion & System Sync</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}