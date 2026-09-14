"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Overview", href: "/overview" },
        { name: "Tasks", href: "/tasks" },
        { name: "Documents", href: "/documents" },
        { name: "Upload", href: "/upload" },
        { name: "Approvals", href: "/approvals", badge: "1" },
        { name: "Activity", href: "/activity" },
    ];

    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-[#1A1512] border-b border-[#F2E9DD]/10 px-4 sm:px-6 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand Logo & Desktop Nav */}
                <div className="flex items-center gap-6 lg:gap-8">
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <span className="font-serif italic text-2xl font-bold text-[#F2E9DD]">
                            LifeOps
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-[#2A231F] text-[#E0924A] px-2 py-0.5 rounded border border-[#F2E9DD]/10 font-semibold">
                            Desk
                        </span>
                    </Link>

                    {/* Desktop Navigation Links (hidden on mobile) */}
                    <nav className="hidden md:flex items-center gap-5 lg:gap-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-xs font-medium transition-colors flex items-center gap-1.5 ${isActive
                                            ? "text-[#F2E9DD] font-bold underline underline-offset-4 decoration-[#E0924A]"
                                            : "text-[#D1C7BD]/70 hover:text-[#F2E9DD]"
                                        }`}
                                >
                                    {link.name}
                                    {link.badge && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-[#E0924A] text-[#1A1512] font-mono text-[10px] font-bold">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Action Controls & Profile / Hamburger Toggle */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Agent Status Indicator (desktop only) */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A231F] border border-[#F2E9DD]/10 text-[11px] font-mono text-[#D1C7BD]">
                        <span className="w-2 h-2 rounded-full bg-[#6B9080] animate-pulse" />
                        <span>Strands Active</span>
                    </div>

                    {/* New Document Button */}
                    <Link
                        href="/upload"
                        onClick={closeMenu}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E0924A] text-[#1A1512] hover:bg-[#d4843c] transition-colors shrink-0"
                    >
                        + New Doc
                    </Link>

                    {/* User Profile Avatar Link */}
                    {status === "authenticated" && session?.user ? (
                        <div className="flex items-center gap-3 pl-1 sm:pl-2 border-l border-[#F2E9DD]/10">
                            <Link
                                href="/profile"
                                onClick={closeMenu}
                                title="View Profile Settings"
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border shrink-0 ${pathname === "/profile"
                                        ? "bg-[#E0924A] text-[#1A1512] border-[#F2E9DD] ring-2 ring-[#E0924A]/40"
                                        : "bg-[#2A231F] text-[#F2E9DD] border-[#F2E9DD]/20 hover:border-[#E0924A]"
                                    }`}
                            >
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    (session.user.name || session.user.email || "A")[0].toUpperCase()
                                )}
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="hidden sm:inline-block text-xs text-[#D1C7BD]/60 hover:text-[#F2E9DD] transition-colors font-mono cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={closeMenu}
                            className="text-xs font-bold text-[#E0924A] hover:underline font-mono"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Mobile Menu"
                        className="md:hidden p-1.5 rounded-lg bg-[#2A231F] text-[#F2E9DD] border border-[#F2E9DD]/15 hover:border-[#E0924A] transition-colors cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden pt-4 pb-2 border-t border-[#F2E9DD]/10 mt-3 space-y-2">
                    {/* Status Badge inside Mobile Menu */}
                    <div className="px-3 py-1.5 rounded-xl bg-[#2A231F] border border-[#F2E9DD]/10 text-xs font-mono text-[#D1C7BD] flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#6B9080] animate-pulse" />
                        <span>Agent Status: Strands Active</span>
                    </div>

                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={closeMenu}
                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${isActive
                                        ? "bg-[#2A231F] text-[#E0924A] font-bold border border-[#E0924A]/30"
                                        : "text-[#D1C7BD] hover:bg-[#2A231F]/50 hover:text-[#F2E9DD]"
                                    }`}
                            >
                                <span>{link.name}</span>
                                {link.badge && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#E0924A] text-[#1A1512] font-mono text-[10px] font-bold">
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {status === "authenticated" && (
                        <div className="pt-2 border-t border-[#F2E9DD]/10">
                            <button
                                onClick={() => {
                                    closeMenu();
                                    signOut({ callbackUrl: "/login" });
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#C1442E] hover:bg-[#C1442E]/10 transition-colors font-mono cursor-pointer"
                            >
                                Sign Out of Desk
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}