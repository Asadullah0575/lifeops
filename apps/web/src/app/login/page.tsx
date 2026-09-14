"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

// 1. Child component containing your form logic & useSearchParams
function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/overview";
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-md rounded-3xl bg-[#2A231F] border border-[#F2E9DD]/15 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
      <div className="mb-6 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#E0924A] font-bold block mb-1">
          Identity Gate
        </span>
        <h1 className="font-serif italic text-3xl font-bold text-[#F2E9DD]">
          LifeOps Desk
        </h1>
        <p className="text-xs text-[#D1C7BD] mt-1 font-sans">
          Sign in to access your operational dashboard and memory strands.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#C1442E]/20 border border-[#C1442E] text-[#F2E9DD] text-xs font-mono">
          Authentication failed. Please verify credentials.
        </div>
      )}

      {/* Demo Quick Sign-In */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => signIn("credentials", { email: "alex.mercer@example.com", callbackUrl })}
          className="w-full py-3 rounded-xl bg-[#E0924A] text-[#1A1512] font-bold text-xs hover:bg-[#d4843c] transition-all cursor-pointer shadow-sm"
        >
          1-Click Demo Sign In (Alex Mercer) &rarr;
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-3 rounded-xl bg-[#1A1512] border border-[#F2E9DD]/20 text-[#F2E9DD] font-bold text-xs hover:bg-[#382F2A] transition-all cursor-pointer font-mono"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

// 2. Main Page Component wrapped in Suspense
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#1A1512] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center font-mono text-xs text-[#D1C7BD]">
            Loading Identity Gate...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}