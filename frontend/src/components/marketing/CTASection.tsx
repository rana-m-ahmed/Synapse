"use client";

import { motion, Variants } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function CTASection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 }
    }
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 100, rotate: 5 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 }
    }
  };

  return (
    <section className="relative bg-sand-bg overflow-hidden z-20 min-h-[80vh] flex items-center justify-center pt-32 pb-40">
      
      <div className="px-margin-mobile md:px-margin-page w-full max-w-screen-2xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Massive Typography */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col select-none"
          >
            <motion.div variants={wordVariants} className="overflow-hidden">
              <h2 className="font-headline-lg text-[80px] md:text-[120px] lg:text-[140px] font-black text-border-subtle uppercase leading-[0.85] tracking-tighter hover:text-white transition-colors duration-500">
                System
              </h2>
            </motion.div>
            <motion.div variants={wordVariants} className="overflow-hidden">
              <h2 className="font-headline-lg text-[80px] md:text-[120px] lg:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-tangerine to-sage-green uppercase leading-[0.85] tracking-tighter">
                Online.
              </h2>
            </motion.div>
            <motion.div variants={wordVariants} className="overflow-hidden">
              <h2 className="font-headline-lg text-[80px] md:text-[120px] lg:text-[140px] font-black text-border-subtle uppercase leading-[0.85] tracking-tighter hover:text-white transition-colors duration-500">
                Ready.
              </h2>
            </motion.div>
          </motion.div>

          {/* Right Side: 3D Holographic API Ticket */}
          <div className="flex justify-center lg:justify-end lg:pr-12 perspective-[2000px]">
            <motion.div 
              initial={{ opacity: 0, rotateY: 20, rotateX: 20, x: 100 }}
              whileInView={{ opacity: 1, rotateY: -5, rotateX: 5, x: 0 }}
              whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className="w-full max-w-md bg-[#111] border border-[#333] p-8 md:p-10 shadow-[0_0_80px_rgba(255,92,0,0.15)] relative overflow-hidden flex flex-col group"
            >
              {/* Ticket Cutouts */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-[#050505] rounded-full border-r border-[#333]"></div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-[#050505] rounded-full border-l border-[#333]"></div>
              
              {/* Holographic scanning line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-tangerine shadow-[0_0_20px_#FF5C00] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_ease-in-out_infinite]"></div>

              {/* Ticket Header */}
              <div className="flex justify-between items-start mb-12 border-b border-[#333] pb-6">
                <div>
                  <span className="font-label-mono text-[10px] uppercase text-[#666] block mb-1">Authorization</span>
                  <span className="font-label-mono text-[16px] text-white font-bold tracking-widest">ACCESS_GRANTED</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="w-3 h-3 rounded-full bg-sage-green animate-pulse mb-2"></span>
                  <span className="font-label-mono text-[10px] text-sage-green uppercase">Live Status</span>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="flex gap-1 h-12 w-full mb-12 opacity-80 mix-blend-screen">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="h-full bg-[#444]" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-auto z-10 relative">
                <p className="font-body-md text-[14px] text-[#888] mb-6">
                  Initiate deployment sequence. Generate your master API keys and launch your autonomous fleet today.
                </p>
                <a href="/register" className="block w-full">
                  <MagneticButton className="w-full py-5 bg-white text-black font-label-mono text-[14px] font-bold uppercase tracking-widest hover:bg-electric-tangerine hover:text-white transition-all duration-300 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    Initialize System
                  </MagneticButton>
                </a>
              </div>

              {/* Decorative dotted line splitting ticket */}
              <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#222] -translate-y-1/2 -z-10"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
