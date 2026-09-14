"use client";

import { useState, useEffect } from "react";
import { ActivityItem } from "@/lib/lifeops-store";

export default function ActivityPage() {
  const defaultActivities: ActivityItem[] = [
    {
      id: "act_1",
      action: "Auto-indexed Fiber Telecom Invoice Sep 2026 into memory",
      timestamp: "Sep 12, 2026 at 10:14 AM",
      type: "upload",
    },
    {
      id: "act_2",
      action: "Created pending payment authorization for $89.00",
      timestamp: "Sep 12, 2026 at 10:15 AM",
      type: "approval",
    },
  ];

  const [activities, setActivities] = useState<ActivityItem[]>(defaultActivities);

  useEffect(() => {
    try {
      const custom = localStorage.getItem("lifeops_activities");
      if (custom) {
        const userActivities: ActivityItem[] = JSON.parse(custom);
        setActivities([...userActivities, ...defaultActivities]);
      }
    } catch (e) {
      console.error("Failed to load activity log", e);
    }
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
      <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
          System Audit Log
        </span>
        <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
          Recent Agent Activity
        </h1>
        <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
          Historical record of document extractions, automated triggers, and governance decisions.
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="rounded-2xl bg-[#2A231F] border border-[#F2E9DD]/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E0924A] shrink-0" />
              <p className="font-mono text-xs sm:text-sm text-[#F2E9DD]">{act.action}</p>
            </div>
            <span className="font-mono text-[10px] text-[#D1C7BD]/50 shrink-0">
              {act.timestamp}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}