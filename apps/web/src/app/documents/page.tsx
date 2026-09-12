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

function TypeTag({ label }: { label: string }) {
    return (
        <span className="text-xs text-ink/50 bg-ink/5 px-2 py-1 rounded-full whitespace-nowrap">
            {label}
        </span>
    );
}

function ReceiptCard({ d }: { d: ReceiptDocument }) {
    return (
        <div className="rounded-2xl bg-ink/5 p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-ink">{d.product}</p>
                <TypeTag label="receipt" />
            </div>
            <div className="text-sm text-ink/60 space-y-1">
                <p>{d.retailer} &middot; {d.date} &middot; <span className="font-mono">{d.amount}</span></p>
                <p>Return window: {d.deadline}</p>
                <p>Warranty: {d.warranty}</p>
            </div>
        </div>
    );
}

function AppointmentCard({ d }: { d: AppointmentDocument }) {
    return (
        <div className="rounded-2xl bg-ink/5 p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-ink">{d.appointment_type}</p>
                <TypeTag label="appointment" />
            </div>
            <div className="text-sm text-ink/60 space-y-1">
                <p>{d.provider} &middot; {d.date} at <span className="font-mono">{d.time}</span></p>
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

    if (error) return <main className="max-w-4xl px-8 py-14 text-stamp">{error}</main>;
    if (!documents) return <main className="max-w-4xl px-8 py-14 text-ink/50">Loading...</main>;

    return (
        <main className="max-w-4xl px-8 py-14">
            <h1 className="font-display italic text-5xl font-light text-ink mb-10">Documents</h1>

            {documents.length === 0 ? (
                <p className="text-sm text-ink/50">No documents processed yet.</p>
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