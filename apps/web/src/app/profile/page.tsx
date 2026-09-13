"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session } = useSession();

    const user = session?.user || {
        name: "Alex Mercer",
        email: "alex.mercer@example.com",
        id: "usr_demo_alex_mercer",
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#F2E9DD]">
            {/* Header */}
            <div className="mb-6 sm:mb-8 pb-6 border-b border-[#F2E9DD]/10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
                    Identity Desk
                </span>
                <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-[#F2E9DD]">
                    Account & Cryptographic Keys
                </h1>
                <p className="text-xs sm:text-sm text-[#D1C7BD] mt-1 font-sans">
                    Manage identity parameters, isolated memory scopes, and active session tokens.
                </p>
            </div>

            {/* Account Card */}
            <div className="rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-[#F2E9DD]/10">
                    <div className="w-16 h-16 rounded-full bg-[#E0924A] text-[#1A1512] font-serif font-bold text-2xl flex items-center justify-center shrink-0">
                        {(user.name || user.email || "A")[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#F2E9DD]">{user.name}</h2>
                        <p className="text-xs font-mono text-[#D1C7BD]">{user.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#33513F]/40 text-[#6B9080] border border-[#33513F] text-[10px] font-mono font-bold uppercase">
                            Isolated Memory Scoped
                        </span>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4 font-mono text-xs">
                    <div>
                        <label className="text-[#D1C7BD]/60 block text-[10px] uppercase mb-1">User Identifier</label>
                        <div className="p-3 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 text-[#F2E9DD] break-all">
                            {user.id || "usr_demo_alex_mercer"}
                        </div>
                    </div>

                    <div>
                        <label className="text-[#D1C7BD]/60 block text-[10px] uppercase mb-1">Session Strategy</label>
                        <div className="p-3 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/10 text-[#F2E9DD]">
                            JWT Token &bull; NextAuth v5 Scoped
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C1442E] text-[#F2E9DD] text-xs font-bold hover:bg-[#a93b27] transition-colors cursor-pointer text-center"
                    >
                        Sign Out of Desk
                    </button>
                    <Link
                        href="/overview"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#382F2A] border border-[#F2E9DD]/20 text-[#F2E9DD] text-xs font-bold hover:bg-[#453b34] transition-colors text-center"
                    >
                        Back to Overview
                    </Link>
                </div>
            </div>
        </main>
    );
}