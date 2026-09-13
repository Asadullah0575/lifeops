"use client";

import Link from "next/link";

const LOOP_STEPS = [
  { step: "01", name: "Detect", desc: "Ingests raw PDFs, txt, or receipts from S3/Upload" },
  { step: "02", name: "Understand", desc: "Classifies type & extracts precise deterministic facts" },
  { step: "03", name: "Decide", desc: "Identifies real obligations, return windows, or fees" },
  { step: "04", name: "Act", desc: "Creates tasks & schedules reminders automatically" },
  { step: "05", name: "Verify", desc: "Confirms execution in DynamoDB audit trail" },
  { step: "06", name: "Remember", desc: "Saves preferences & patterns into AgentCore Memory" },
  { step: "07", name: "Escalate", desc: "Pauses for human approval on high-risk actions" },
];

export default function LandingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24 text-[#F2E9DD]">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A231F] border border-[#F2E9DD]/15 text-xs text-[#E0924A] mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E0924A] animate-pulse" />
        <span className="font-mono">Autonomous Personal Operations Agent &middot; Built on Strands & AWS</span>
      </div>

      {/* Main Headline */}
      <h1 className="font-serif italic text-5xl sm:text-7xl font-light text-[#F2E9DD] mb-6 leading-[1.1] tracking-tight">
        Hand it a document.
        <br />
        <span className="text-[#E0924A] font-normal">It decides</span> what happens next.
      </h1>

      <p className="text-lg sm:text-xl text-[#D1C7BD] max-w-2xl mb-10 leading-relaxed font-sans">
        LifeOps parses receipts, appointment confirmations, and complex policies into verified
        calendar reminders, tracked tasks, and long-term memory. Routine actions happen autonomously.
        Financial charges or irreversible choices wait for your explicit approval.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-20">
        <Link
          href="/upload"
          className="text-sm font-bold px-6 py-3.5 rounded-xl bg-[#E0924A] text-[#1A1512] border-2 border-[#1A1512] shadow-[3px_3px_0px_0px_#1A1512] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#1A1512] transition-all"
        >
          Try Demo Scenarios
        </Link>
        <Link
          href="/overview"
          className="text-sm font-bold px-6 py-3.5 rounded-xl bg-[#2A231F] text-[#F2E9DD] border border-[#F2E9DD]/20 hover:bg-[#382F2A] hover:border-[#F2E9DD]/40 transition-all"
        >
          Open Operations Desk
        </Link>
      </div>

      {/* Autonomous Loop Visualizer */}
      <div className="mb-20 rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 sm:p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#E0924A] font-bold">Core Architecture</p>
            <h2 className="font-serif italic text-2xl text-[#F2E9DD] mt-1">The 7-Step Autonomous Loop</h2>
          </div>
          <span className="text-xs font-mono text-[#D1C7BD]/60 hidden sm:inline-block">Zero Chat Clutter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {LOOP_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`rounded-xl p-3.5 border transition-all ${idx === 6
                  ? "bg-[#C1442E]/15 border-[#C1442E]/40 text-[#F2E9DD]"
                  : "bg-[#1A1512]/60 border-[#F2E9DD]/10 text-[#F2E9DD]"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] text-[#D1C7BD]/60">{s.step}</span>
                {idx === 6 && (
                  <span className="text-[9px] uppercase tracking-wider font-mono px-1 py-0.5 rounded bg-[#C1442E]/30 text-[#F2E9DD] font-bold">
                    Safe
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold mb-1 text-[#F2E9DD]">{s.name}</p>
              <p className="text-[11px] text-[#D1C7BD] leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="w-8 h-8 rounded-lg bg-[#33513F]/30 text-[#6B9080] border border-[#33513F]/50 flex items-center justify-center font-mono text-xs font-bold mb-4">
            01
          </div>
          <h3 className="font-serif italic text-xl text-[#F2E9DD] mb-2">Understands Documents</h3>
          <p className="text-sm text-[#D1C7BD] leading-relaxed">
            Strands Research Agent extracts exact dates, providers, return deadlines, and cancellation
            clauses without hallucinating.
          </p>
        </div>

        <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="w-8 h-8 rounded-lg bg-[#E0924A]/20 text-[#E0924A] border border-[#E0924A]/40 flex items-center justify-center font-mono text-xs font-bold mb-4">
            02
          </div>
          <h3 className="font-serif italic text-xl text-[#F2E9DD] mb-2">Autonomous Action & Audit</h3>
          <p className="text-sm text-[#D1C7BD] leading-relaxed">
            Schedules tasks and reminders in DynamoDB, executes verification checks, and commits
            context to AgentCore memory without prompting.
          </p>
        </div>

        <div className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="w-8 h-8 rounded-lg bg-[#C1442E]/20 text-[#C1442E] border border-[#C1442E]/40 flex items-center justify-center font-mono text-xs font-bold mb-4">
            03
          </div>
          <h3 className="font-serif italic text-xl text-[#F2E9DD] mb-2">Human-in-the-Loop Safety</h3>
          <p className="text-sm text-[#D1C7BD] leading-relaxed">
            Refunds, cancellation penalties, or irreversible actions immediately pause for your review.
            You remain in control of consequential decisions.
          </p>
        </div>
      </div>
    </main>
  );
}