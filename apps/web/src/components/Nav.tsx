"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchOverview } from "@/lib/api";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
  { href: "/upload", label: "Upload" },
  { href: "/approvals", label: "Approvals", hasBadge: true },
  { href: "/activity", label: "Activity" },
];

export default function Nav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    function updateCount() {
      fetchOverview()
        .then((data) => {
          if (mounted && data) {
            setPendingCount(data.pending_approval_count || 0);
          }
        })
        .catch(() => {});
    }

    updateCount();
    const interval = setInterval(updateCount, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2"
            title="LifeOps — Autonomous Operations Desk"
          >
            <span className="font-display italic text-kraft tracking-tight text-2xl font-light group-hover:text-kraft/90 transition-colors">
              LifeOps
            </span>
            <span className="text-[10px] tracking-widest uppercase font-mono px-1.5 py-0.5 rounded bg-ink/5 text-ink/40 border border-ink/10 hidden sm:inline-block">
              DESK
            </span>
          </Link>

          <nav className="flex gap-1 sm:gap-4 h-16 overflow-x-auto no-scrollbar">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm h-full flex items-center gap-1.5 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? "border-kraft text-ink font-medium"
                      : "border-transparent text-ink/60 hover:text-ink/90"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasBadge && pendingCount > 0 && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-stamp/20 text-stamp border border-stamp/30"
                      title={`${pendingCount} pending approval${pendingCount > 1 ? "s" : ""}`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-ink/5 border border-ink/10 text-xs text-ink/60">
            <span className="w-2 h-2 rounded-full bg-ledger" />
            <span className="font-mono text-[11px] text-ink/70">Strands Agent Active</span>
          </div>

          <Link
            href="/upload"
            className="text-xs px-3.5 py-1.5 rounded-full bg-kraft hover:bg-kraft/90 text-paper font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            + New Doc
          </Link>
        </div>
      </div>
    </header>
  );
}