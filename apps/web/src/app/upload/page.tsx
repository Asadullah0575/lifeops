"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { uploadDocument, UploadResult } from "@/lib/api";

interface UploadedFileInfo {
    id: string;
    name: string;
    size: string;
    type: string;
    category: string;
    date: string;
    status: "Verified" | "Parsing" | "Flagged";
    facts?: Record<string, string>;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const processAndUploadFile = async (file: File) => {
        setErrorMessage(null);

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setErrorMessage("File exceeds the maximum size limit of 25MB.");
            return;
        }

        setIsUploading(true);

        try {
            // Call your real backend endpoint via api.ts
            const response: UploadResult = await uploadDocument(file);

            const fileObj: UploadedFileInfo = {
                id: response.document_id || `doc_${Date.now()}`,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type || "text/plain",
                category: response.document_type ? `${response.document_type.toUpperCase()}` : "User Document",
                date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
                status: "Verified",
                facts: response.facts,
            };

            setUploadedFile(fileObj);
            setUploadSuccess(true);
        } catch (err: unknown) {
            console.error("Upload Error:", err);
            const errorStr = err instanceof Error ? err.message : "Failed to process document with killer_workflow backend.";
            setErrorMessage(errorStr);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processAndUploadFile(e.target.files[0]);
        }
        // Reset file input so selecting the same file twice triggers onChange
        e.target.value = "";
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processAndUploadFile(e.dataTransfer.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleReset = () => {
        setUploadSuccess(false);
        setUploadedFile(null);
        setErrorMessage(null);
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.txt,text/plain"
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
                    Documents uploaded here are processed through Bedrock AgentCore and indexed directly into memory.
                </p>
            </div>

            <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
                {uploadSuccess ? (
                    <div className="space-y-6 py-4">
                        <div className="w-12 h-12 rounded-full bg-[#33513F]/40 border border-[#6B9080] text-[#6B9080] flex items-center justify-center mx-auto text-xl font-bold">
                            ✓
                        </div>
                        <h3 className="font-serif italic text-2xl font-bold text-[#F2E9DD]">
                            Document Ingested Successfully
                        </h3>

                        {uploadedFile && (
                            <div className="max-w-md mx-auto p-4 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 text-left flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-[#2A231F] text-[#E0924A] font-mono text-xs font-bold uppercase">
                                    {uploadedFile.name.split(".").pop() || "TXT"}
                                </div>
                                <div className="truncate flex-1">
                                    <p className="text-sm font-semibold text-[#F2E9DD] truncate">
                                        {uploadedFile.name}
                                    </p>
                                    <p className="text-xs font-mono text-[#D1C7BD]/60 mt-0.5">
                                        {uploadedFile.size} • {uploadedFile.date}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/20 text-xs font-bold hover:bg-[#382F2A] transition-colors cursor-pointer"
                            >
                                Upload Another
                            </button>
                            <Link
                                href="/documents"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E0924A] text-[#1A1512] text-xs font-bold hover:bg-[#d4843c] transition-colors"
                            >
                                View Documents →
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div
                            onClick={triggerFileInput}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full border-2 border-dashed rounded-2xl p-8 transition-colors cursor-pointer bg-[#1A1512]/50 block text-center ${isDragging
                                    ? "border-[#E0924A] bg-[#2A231F]"
                                    : "border-[#F2E9DD]/20 hover:border-[#E0924A]"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-[#2A231F] border border-[#F2E9DD]/15 flex items-center justify-center mx-auto text-[#E0924A] text-xl font-bold mb-3 pointer-events-none">
                                ↑
                            </div>
                            <p className="text-sm font-semibold text-[#F2E9DD] pointer-events-none">
                                {isDragging ? "Drop your file here..." : "Tap or click here to choose a file"}
                            </p>
                            <p className="text-xs font-mono text-[#D1C7BD]/60 mt-1 pointer-events-none">
                                Supports PDF, PNG, JPG, TXT up to 25MB
                            </p>
                        </div>

                        {errorMessage && (
                            <p className="text-xs font-mono text-red-400 bg-red-950/40 border border-red-800/50 py-2 px-4 rounded-lg">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isUploading}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E0924A] text-[#1A1512] font-bold text-xs hover:bg-[#d4843c] transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {isUploading ? (
                                <span className="font-mono">Processing Workflow Strands...</span>
                            ) : (
                                <span>Choose & Process Document</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}