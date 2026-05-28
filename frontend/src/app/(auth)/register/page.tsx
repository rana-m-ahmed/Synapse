"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signup } from "./actions";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Suspense } from "react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-md bg-surface-container-lowest border border-border-subtle p-8 md:p-12 shadow-[0_20px_50px_rgba(17,17,17,0.04)] z-10 relative">
      <div className="absolute top-0 right-0 w-full h-[2px] bg-sage-green"></div>
      
      <h1 className="font-headline-lg text-[32px] font-bold text-charcoal-text mb-2">
        Sign Up
      </h1>
      <p className="font-body-md text-on-surface-variant mb-8">
        Create a new Synapse account.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none"></div>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">flag</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-sand-bg/80 mb-1">Attention Required</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form action={signup} className="space-y-6 flex flex-col">
        <div className="space-y-2">
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-charcoal-text">
            Email Address
          </label>
          <input 
            name="email"
            type="email" 
            required
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
            placeholder="operator@synapse.com"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-charcoal-text">
            Password
          </label>
          <input 
            name="password"
            type="password" 
            required
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
            placeholder="••••••••"
          />
        </div>

        <MagneticButton type="submit" className="w-full bg-charcoal-text text-sand-bg font-label-mono text-[12px] py-4 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 mt-4 flex justify-center items-center">
          Create Account
          <span className="material-symbols-outlined ml-2 text-[16px]">arrow_forward</span>
        </MagneticButton>
      </form>

      <div className="mt-8 pt-8 border-t border-border-subtle text-center">
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-sage-green hover:text-electric-tangerine font-bold underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-bg relative px-margin-mobile">
      <Suspense fallback={<div className="font-label-mono text-[12px]">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
