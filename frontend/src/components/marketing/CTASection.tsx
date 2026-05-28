"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function CTASection() {
  return (
    <section className="relative bg-surface-container-lowest overflow-hidden z-20 border-t border-border-subtle">
      {/* Animated gradient border top */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-[linear-gradient(90deg,transparent,rgba(255,92,0,0.6),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
      
      <div className="py-20 md:py-32 px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto flex flex-col items-center text-center relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-electric-tangerine/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-label-mono text-[10px] md:text-[12px] uppercase tracking-widest text-electric-tangerine mb-6 block"
        >
          Get Started Today
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-headline-lg text-[32px] sm:text-[40px] md:text-[56px] font-bold text-charcoal-text mb-6 leading-tight max-w-3xl"
        >
          Ready to Deploy<br />Intelligence?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-body-md text-[16px] md:text-[18px] text-on-surface-variant max-w-lg mb-10"
        >
          Join thousands of teams using Synapse to automate support, onboard users, and scale intelligence across their products.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
        >
          <a href="/register">
            <MagneticButton className="inline-flex items-center justify-center bg-electric-tangerine text-white font-label-mono text-[12px] px-10 py-4 rounded-full shadow-[0_8px_24px_rgba(255,92,0,0.4)] hover:shadow-[0_12px_32px_rgba(255,92,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 group">
              Get Started Free
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </MagneticButton>
          </a>
          <a href="#features" className="inline-flex items-center justify-center font-label-mono text-[12px] px-8 py-4 text-charcoal-text border border-border-subtle rounded-full hover:border-charcoal-text transition-all duration-300">
            Explore Features
          </a>
        </motion.div>
      </div>
    </section>
  );
}
