"use client";

import { useState, useRef } from "react";

type DocumentFacts = Record<string, string>;

type UploadResult = {
    document_id: string;
    facts: DocumentFacts;
    result: string;
};

export default function UploadPage() {
    const [result, setResult] = useState<UploadResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        setFileName(file.name);
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/upload", {
                method: "POST",
                headers: { "x-api-key": process.env.NEXT_PUBLIC_LIFEOPS_API_KEY || "" },
                body: formData,
            });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            const data: UploadResult = await res.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-3xl mx-auto p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Upload a document</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Receipts, appointment confirmations, or anything with a date LifeOps should track.
                </p>
            </div>

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
                <p className="text-sm text-gray-600">
                    {fileName ? fileName : "Click to choose a file, or drag one here"}
                </p>
                <p className="text-xs text-gray-400 mt-1">.txt files, up to 10MB</p>
            </div>

            {loading && (
                <div className="border rounded-lg p-4 flex items-center gap-3 text-sm text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
                    Processing document...
                </div>
            )}

            {error && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-2">
                        <p className="text-xs text-gray-400">Document ID: {result.document_id}</p>
                        {Object.entries(result.facts).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b last:border-b-0 py-1.5 text-sm">
                                <span className="font-medium capitalize text-gray-700">
                                    {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-gray-600 text-right">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm font-medium mb-2 text-gray-700">What LifeOps did</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.result}</p>
                    </div>
                </div>
            )}
        </main>
    );
}