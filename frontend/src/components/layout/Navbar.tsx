"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { scrollY } = useScroll();
  const yNav = useTransform(scrollY, [0, 100], [0, -100]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.header
        style={{ y: yNav }}
        className="docked full-width top-0 z-40 bg-sand-bg/90 backdrop-blur-md border-b border-border-subtle sticky transition-transform duration-500"
      >
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-page py-5 md:py-8 max-w-screen-2xl mx-auto">
          <a
            className="font-headline-md text-[28px] md:text-[32px] font-medium tracking-tighter text-charcoal-text"
            href="/"
          >
            Synapse
          </a>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Features</a>
            <a href="#platform" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Platform</a>
            <a href="#demo" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Live Demo</a>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <a href="/login" className="inline-flex items-center justify-center bg-transparent text-charcoal-text font-label-mono text-[12px] px-6 py-2.5 border border-border-subtle rounded-full hover:border-electric-tangerine hover:text-electric-tangerine transition-all duration-300 magnetic">
              Login
            </a>
            <a href="/register" className="inline-flex items-center justify-center bg-electric-tangerine text-white font-label-mono text-[12px] px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(255,92,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,92,0,0.23)] hover:-translate-y-0.5 transition-all duration-300 magnetic">
              Sign Up
            </a>
          </div>
          {/* Mobile hamburger */}
          <button 
            className="md:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px] text-charcoal-text">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-0 z-50 bg-sand-bg/98 backdrop-blur-xl flex flex-col md:hidden"
          >
            {/* Mobile header */}
            <div className="flex justify-between items-center px-margin-mobile py-5 border-b border-border-subtle">
              <a href="/" className="font-headline-md text-[28px] font-medium tracking-tighter text-charcoal-text">
                Synapse
              </a>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <span className="material-symbols-outlined text-[24px] text-charcoal-text">close</span>
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 flex flex-col justify-center px-margin-mobile space-y-8">
              {[
                { label: "Features", href: "#features" },
                { label: "Platform", href: "#platform" },
                { label: "Live Demo", href: "#demo" },
              ].map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="text-charcoal-text font-headline-md text-[32px] font-bold tracking-tight hover:text-electric-tangerine transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            {/* Mobile CTA buttons */}
            <div className="px-margin-mobile pb-12 space-y-3">
              <a 
                href="/login" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-4 border border-border-subtle text-charcoal-text font-label-mono text-[12px] uppercase tracking-widest rounded-full hover:border-charcoal-text transition-colors"
              >
                Login
              </a>
              <a 
                href="/register" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-4 bg-electric-tangerine text-white font-label-mono text-[12px] uppercase tracking-widest rounded-full shadow-[0_4px_14px_0_rgba(255,92,0,0.39)]"
              >
                Sign Up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
