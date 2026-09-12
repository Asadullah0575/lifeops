"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/overview", label: "Overview" },
    { href: "/tasks", label: "Tasks" },
    { href: "/documents", label: "Documents" },
    { href: "/upload", label: "Upload" },
    { href: "/approvals", label: "Approvals" },
    { href: "/activity", label: "Activity" },
];

export default function Nav() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-10 bg-paper border-b border-ink/15">
            <div className="max-w-4xl px-8 h-16 flex items-center gap-8">
                <Link href="/overview" className="font-display italic text-kraft tracking-tight text-xl">
                    LifeOps
                </Link>
                <div className="flex gap-6 h-full">
                    {links.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm h-full flex items-center border-b-2 transition-colors ${active
                                        ? "border-ink text-ink font-medium"
                                        : "border-transparent text-ink/50 hover:text-ink/80"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}