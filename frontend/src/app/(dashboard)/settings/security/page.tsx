"use client";

import { useSearchParams } from "next/navigation";
import { changePassword } from "./actions";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Suspense } from "react";

function SecuritySettingsForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-12 border-b border-border-subtle pb-6">
        <span className="font-label-mono text-[12px] uppercase tracking-widest text-sage-green mb-2 block">
          Settings
        </span>
        <h1 className="font-headline-lg text-[32px] md:text-[40px] font-bold text-charcoal-text">
          Security
        </h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Manage your credentials and account security.
        </p>
      </div>

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

      {message && (
        <div className="mb-6 p-4 bg-sage-green text-surface-container-lowest font-body-md shadow-lg flex items-start gap-3 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-black/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none"></div>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-surface-container-lowest/80 mb-1">Success</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-border-subtle p-8 md:p-12 shadow-[0_20px_50px_rgba(17,17,17,0.04)] relative">
        <div className="absolute top-0 right-0 w-full h-[2px] bg-electric-tangerine"></div>
        
        <h2 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-2">
          Change Password
        </h2>
        <p className="font-body-md text-on-surface-variant mb-8">
          Ensure your account uses a long, random password to stay secure.
        </p>

        <form action={changePassword} className="space-y-6 flex flex-col max-w-md">
          <div className="space-y-2">
            <label className="font-label-mono text-[10px] uppercase tracking-widest text-charcoal-text">
              New Password
            </label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label-mono text-[10px] uppercase tracking-widest text-charcoal-text">
              Confirm New Password
            </label>
            <input 
              name="confirmPassword"
              type="password" 
              required
              className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <MagneticButton type="submit" className="w-full bg-charcoal-text text-sand-bg font-label-mono text-[12px] py-4 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 flex justify-center items-center">
              Update Credentials
              <span className="material-symbols-outlined ml-2 text-[16px]">lock_reset</span>
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={<div className="font-label-mono text-[12px] text-on-surface-variant">Loading Security Settings...</div>}>
      <SecuritySettingsForm />
    </Suspense>
  );
}
