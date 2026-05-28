"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";

export function DemoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="demo" className="py-stack-xl px-margin-mobile md:px-margin-page bg-surface border-y border-border-subtle relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] z-20">
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-stack-md z-10">
          <h2 className="font-headline-md text-[28px] md:text-[32px] text-charcoal-text mb-4">
            General Intelligence.
          </h2>
          <p className="font-body-md text-[16px] md:text-[18px] text-on-surface-variant mb-8 max-w-md mx-auto">
            Synapse isn't just another generic bot. It deeply understands your business logic, 
            API documentation, and customer context out of the box.
          </p>
        </div>
        {/* The Widget Container */}
        <div className="relative w-full max-w-md mx-auto h-[450px] flex items-end justify-center z-10">
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className="absolute bottom-0 w-full bg-surface-container-lowest border border-border-subtle shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col h-[450px] z-20 rounded-t-xl overflow-hidden"
              >
                <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container">
                  <span className="font-label-mono text-[12px] font-bold text-charcoal-text">
                    Synapse Assistant
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></span>
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="text-on-surface-variant hover:text-charcoal-text transition-colors"
                      aria-label="Close chat"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col bg-surface-container-lowest">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="self-start max-w-[85%]"
                  >
                    <p className="font-body-md text-[14px] md:text-[16px] text-on-surface-variant bg-surface-container p-3 md:p-4 border border-border-subtle rounded-tr-xl rounded-br-xl rounded-bl-xl">
                      Welcome back. I notice you were looking at the API documentation yesterday. Need help implementing the webhooks?
                    </p>
                    <span className="font-label-mono text-[10px] text-on-surface-variant mt-2 block">10:42 AM</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                    className="self-end max-w-[85%]"
                  >
                    <p className="font-body-md text-[14px] md:text-[16px] text-sand-bg bg-electric-tangerine p-3 md:p-4 rounded-tl-xl rounded-br-xl rounded-bl-xl shadow-md">
                      Yes, exactly. I'm getting a 401 error.
                    </p>
                    <span className="font-label-mono text-[10px] text-on-surface-variant mt-2 block text-right">10:43 AM</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                    className="self-start max-w-[85%] relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-tangerine origin-left animate-[shimmer_2s_ease-in-out_infinite]"></div>
                    <p className="font-body-md text-[14px] md:text-[16px] text-on-surface-variant bg-surface-container p-3 md:p-4 border border-border-subtle rounded-tr-xl rounded-br-xl rounded-bl-xl mt-2">
                      Ah, a 401. Let's check your authentication headers. Ensure you're passing the Bearer token correctly. Here's a snippet:
                    </p>
                  </motion.div>
                </div>
                <div className="p-4 border-t border-border-subtle bg-surface-container flex items-center">
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-[14px] md:text-[16px] placeholder:text-on-surface-variant/50 outline-none text-charcoal-text"
                    placeholder="Type a message..."
                    type="text"
                  />
                  <button className="text-electric-tangerine hover:text-white transition-colors">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* The Pill Button — click to toggle */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-0 z-30"
              >
                <MagneticButton 
                  onClick={() => setIsOpen(true)}
                  className="bg-electric-tangerine text-white px-8 py-4 rounded-full font-label-mono text-[12px] flex items-center gap-3 shadow-[0_8px_24px_rgba(255,92,0,0.35)] hover:shadow-[0_12px_32px_rgba(255,92,0,0.45)] transition-all duration-300"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  Test Widget
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,92,0,0.03)_0%,transparent_70%)] pointer-events-none"></div>
    </section>
  );
}
