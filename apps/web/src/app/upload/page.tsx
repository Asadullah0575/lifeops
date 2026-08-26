"use client";

import { useState } from "react";

type DocumentFacts = {
    product: string;
    date: string;
    retailer: string;
    amount: string;
    deadline: string;
    warranty: string;
    responsibility: string;
};

type UploadResult = {
    document_id: string;
    facts: DocumentFacts;
};

export default function UploadPage() {
    const [result, setResult] = useState<UploadResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/upload", {
                method: "POST",
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
        <main className="max-w-xl mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Upload a document</h1>
            <input type="file" onChange={handleUpload} className="mb-6" />

            {loading && <p>Processing...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {result && (
                <div className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-500">
                        Document ID: {result.document_id}
                    </p>
                    {Object.entries(result.facts).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b py-1">
                            <span className="font-medium capitalize">{key}</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}