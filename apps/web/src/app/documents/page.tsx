"use client";

import { useEffect, useState } from "react";

type ReceiptDocument = {
    document_type?: "receipt";
    document_id: string;
    product: string;
    date: string;
    retailer: string;
    amount: string;
    deadline: string;
    warranty: string;
    status: string;
};

type AppointmentDocument = {
    document_type: "appointment";
    document_id: string;
    appointment_type: string;
    provider: string;
    date: string;
    time: string;
    location: string;
    prep_instructions: string;
    cancellation_policy: string;
    status: string;
};

type Document = ReceiptDocument | AppointmentDocument;

function ReceiptCard({ d }: { d: ReceiptDocument }) {
    return (
        <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{d.product}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    🧾 {d.status}
                </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
                <p>{d.retailer} &middot; {d.date} &middot; {d.amount}</p>
                <p>Return window: {d.deadline}</p>
                <p>Warranty: {d.warranty}</p>
            </div>
        </div>
    );
}

function AppointmentCard({ d }: { d: AppointmentDocument }) {
    return (
        <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{d.appointment_type}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    📅 {d.status}
                </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
                <p>{d.provider} &middot; {d.date} at {d.time}</p>
                <p>{d.location}</p>
                <p>Prep: {d.prep_instructions}</p>
                <p>Cancellation: {d.cancellation_policy}</p>
            </div>
        </div>
    );
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/documents")
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                return res.json();
            })
            .then(setDocuments)
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <main className="p-8 text-red-600">{error}</main>;
    if (!documents) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-3xl mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-6">Documents</h1>

            {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents processed yet.</p>
            ) : (
                <div className="space-y-3">
                    {documents.map((d) =>
                        d.document_type === "appointment" ? (
                            <AppointmentCard key={d.document_id} d={d} />
                        ) : (
                            <ReceiptCard key={d.document_id} d={d as ReceiptDocument} />
                        )
                    )}
                </div>
            )}
        </main>
    );
}