"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "./actions";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Suspense } from "react";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-md bg-surface-container-lowest border border-border-subtle p-8 md:p-12 shadow-[0_20px_50px_rgba(17,17,17,0.04)] z-10 relative">
      <div className="absolute top-0 right-0 w-full h-[2px] bg-electric-tangerine"></div>
      
      <h1 className="font-headline-lg text-[32px] font-bold text-charcoal-text mb-2">
        Reset Password
      </h1>
      <p className="font-body-md text-on-surface-variant mb-8">
        Enter your email to receive a recovery link.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-error text-white font-body-md shadow-lg flex items-start gap-3 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none"></div>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">flag</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-white/80 mb-1">Attention Required</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form action={resetPassword} className="space-y-6 flex flex-col">
        <div className="space-y-2">
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-charcoal-text">
            Email Address
          </label>
          <input 
            name="email"
            type="email" 
            required
            className="w-full bg-surface border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-electric-tangerine transition-colors"
            placeholder="operator@synapse.com"
          />
        </div>

        <MagneticButton type="submit" className="w-full bg-charcoal-text text-surface-container-lowest font-label-mono text-[12px] py-4 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 mt-4 flex justify-center items-center">
          Send Recovery Link
          <span className="material-symbols-outlined ml-2 text-[16px]">mail</span>
        </MagneticButton>
      </form>

      <div className="mt-8 pt-8 border-t border-border-subtle text-center">
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Remember your password?{" "}
          <Link href="/login" className="text-electric-tangerine hover:text-charcoal-text font-bold underline transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container relative px-margin-mobile">
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link href="/" className="font-headline-md text-[24px] font-medium tracking-tighter text-charcoal-text hover:text-electric-tangerine transition-colors">
          Synapse
        </Link>
      </div>
      <Suspense fallback={<div className="font-label-mono text-[12px] text-on-surface-variant">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
