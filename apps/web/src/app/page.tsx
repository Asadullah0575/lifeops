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
    <main className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/5 border border-ink/10 text-xs text-kraft mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-kraft animate-pulse" />
        <span>Autonomous Personal Operations Agent &middot; Built on Strands & AWS</span>
      </div>

      {/* Main Headline */}
      <h1 className="font-display italic text-5xl sm:text-7xl font-light text-ink mb-6 leading-[1.1] tracking-tight">
        Hand it a document.
        <br />
        <span className="text-kraft font-normal">It decides</span> what happens next.
      </h1>

      <p className="text-lg sm:text-xl text-ink/70 max-w-2xl mb-10 leading-relaxed font-light">
        LifeOps parses receipts, appointment confirmations, and complex policies into verified
        calendar reminders, tracked tasks, and long-term memory. Routine actions happen autonomously.
        Financial charges or irreversible choices wait for your explicit approval.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-20">
        <Link
          href="/upload"
          className="text-sm px-6 py-3 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors shadow-lg shadow-kraft/10 flex items-center gap-2"
        >
          <span>Try Demo Scenarios</span>
          <span className="font-mono">&rarr;</span>
        </Link>
        <Link
          href="/overview"
          className="text-sm px-6 py-3 rounded-full bg-ink/5 hover:bg-ink/10 text-ink border border-ink/10 transition-colors"
        >
          Open Operations Desk
        </Link>
      </div>

      {/* Autonomous Loop Visualizer */}
      <div className="mb-20 rounded-3xl bg-ink/5 border border-ink/10 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-mono text-kraft">Core Architecture</p>
            <h2 className="font-display italic text-2xl text-ink mt-1">The 7-Step Autonomous Loop</h2>
          </div>
          <span className="text-xs font-mono text-ink/40 hidden sm:inline-block">Zero Chat Clutter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {LOOP_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`rounded-xl p-3.5 border transition-all ${
                idx === 6
                  ? "bg-stamp/10 border-stamp/30 text-stamp"
                  : "bg-paper/40 border-ink/10 text-ink"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] opacity-50">{s.step}</span>
                {idx === 6 && (
                  <span className="text-[9px] uppercase tracking-wider font-mono px-1 py-0.5 rounded bg-stamp/20 text-stamp font-bold">
                    Safe
                  </span>
                )}
              </div>
              <p className="text-sm font-medium mb-1">{s.name}</p>
              <p className="text-[11px] opacity-70 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-6">
          <div className="w-8 h-8 rounded-full bg-ledger/20 text-ledger flex items-center justify-center font-mono text-xs font-bold mb-4">
            01
          </div>
          <h3 className="font-display italic text-xl text-ink mb-2">Understands Documents</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            Strands Research Agent extracts exact dates, providers, return deadlines, and cancellation
            clauses without hallucinating.
          </p>
        </div>

        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-6">
          <div className="w-8 h-8 rounded-full bg-kraft/20 text-kraft flex items-center justify-center font-mono text-xs font-bold mb-4">
            02
          </div>
          <h3 className="font-display italic text-xl text-ink mb-2">Autonomous Action & Audit</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            Schedules tasks and reminders in DynamoDB, executes verification checks, and commits
            context to AgentCore memory without prompting.
          </p>
        </div>

        <div className="rounded-2xl bg-ink/5 border border-ink/10 p-6">
          <div className="w-8 h-8 rounded-full bg-stamp/20 text-stamp flex items-center justify-center font-mono text-xs font-bold mb-4">
            03
          </div>
          <h3 className="font-display italic text-xl text-ink mb-2">Human-in-the-Loop Safety</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            Refunds, cancellation penalties, or irreversible actions immediately pause for your review.
            You remain in control of consequential decisions.
          </p>
        </div>
      </div>
    </main>
  );
}