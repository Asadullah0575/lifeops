export default function LandingPage() {
  return (
    <main className="max-w-4xl px-8 py-24">
      <p className="text-sm text-kraft mb-4">Autonomous personal operations</p>
      <h1 className="font-display italic text-6xl font-light text-ink mb-6 leading-tight">
        Hand it a document.
        <br />
        It decides what happens next.
      </h1>
      <p className="text-lg text-ink/60 max-w-xl mb-10">
        LifeOps reads receipts, appointments, anything with a real deadline, and
        turns them into tracked tasks, reminders, and verified actions, on its
        own. Anything involving money or something irreversible waits for you.
      </p>
      <div className="flex gap-4 mb-20">
        <a href="/upload" className="text-sm px-6 py-3 rounded-full bg-kraft text-paper font-medium">
          Upload a document
        </a>
        <a href="/overview" className="text-sm px-6 py-3 rounded-full bg-ink/5 text-ink">
          View dashboard
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-ink/5 p-5">
          <p className="text-ink mb-2">Understands the document</p>
          <p className="text-sm text-ink/60">
            Classifies what it's looking at and extracts the facts that actually matter.
          </p>
        </div>
        <div className="rounded-2xl bg-ink/5 p-5">
          <p className="text-ink mb-2">Acts on its own</p>
          <p className="text-sm text-ink/60">
            Creates tasks and reminders, verified and logged, without you asking.
          </p>
        </div>
        <div className="rounded-2xl bg-ink/5 p-5">
          <p className="text-ink mb-2">Asks when it matters</p>
          <p className="text-sm text-ink/60">
            Money, cancellations, anything irreversible pauses for your approval first.
          </p>
        </div>
      </div>
    </main>
  );
}