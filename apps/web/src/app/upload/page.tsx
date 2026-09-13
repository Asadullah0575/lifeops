"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleSimulatedUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(true);
        }, 1500);
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            {/* Header */}
            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                    Ingestion Portal
                </span>
                <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                    Upload Document or Receipt
                </h1>
                <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                    Documents uploaded here are automatically parsed by background agent strands and indexed into memory.
                </p>
            </div>

            {/* Main Upload Dropzone Card */}
            <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
                {uploadSuccess ? (
                    <div className="space-y-4 py-6">
                        <div className="w-12 h-12 rounded-full bg-[#33513F]/40 border border-[#6B9080] text-[#6B9080] flex items-center justify-center mx-auto text-xl font-bold">
                            &check;
                        </div>
                        <h3 className="font-serif italic text-2xl font-bold text-[#F2E9DD]">
                            Document Ingested Successfully
                        </h3>
                        <p className="text-xs font-mono text-[#D1C7BD]">
                            Extracting line items and scheduling governance checks...
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => setUploadSuccess(false)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/20 text-xs font-bold hover:bg-[#382F2A] transition-colors"
                            >
                                Upload Another
                            </button>
                            <Link
                                href="/documents"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] text-xs font-bold hover:bg-[#d4843c] transition-colors"
                            >
                                View Documents &rarr;
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-[#F2E9DD]/20 hover:border-[#E0924A] rounded-2xl p-8 transition-colors cursor-pointer bg-[#1A1512]/50">
                            <div className="w-12 h-12 rounded-full bg-[#2A231F] border border-[#F2E9DD]/15 flex items-center justify-center mx-auto text-[#E0924A] text-xl font-bold mb-3">
                                &uarr;
                            </div>
                            <p className="text-sm font-semibold text-[#F2E9DD]">
                                Tap or drag files here to begin parsing
                            </p>
                            <p className="text-xs font-mono text-[#D1C7BD]/60 mt-1">
                                Supports PDF, PNG, JPG up to 25MB
                            </p>
                        </div>

                        <button
                            onClick={handleSimulatedUpload}
                            disabled={isUploading}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E0924A] text-[#1A1512] font-bold text-xs hover:bg-[#d4843c] transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {isUploading ? (
                                <span className="font-mono">Parsing Document Strands...</span>
                            ) : (
                                <span>Simulate Document Ingestion</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}