"use client";

import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import React, { useRef } from "react";

// Interactive 3D Card Component
function InteractiveCard({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movements
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse coordinates to rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div id="features" className="relative bg-surface-container-lowest z-10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-tangerine/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sage-green/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-stack-xl px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto relative z-10"
      >
        <div className="text-center max-w-3xl mx-auto mb-stack-lg">
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-label-mono text-[12px] uppercase tracking-widest text-electric-tangerine mb-4 block"
          >
            Business Value
          </motion.span>
          <motion.h2 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-headline-lg text-[32px] md:text-[56px] font-bold text-charcoal-text leading-tight mb-6"
          >
            Instant Intelligence. <br/>Infinite Scale.
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-body-md text-[18px] text-on-surface-variant max-w-2xl mx-auto"
          >
            Eliminate operational bottlenecks. Deploy AI agents that instantly ingest your data and deliver flawless customer experiences 24/7.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20" style={{ perspective: 2000 }}>
          
          {/* Card 1 */}
          <motion.div variants={cardVariants} className="w-full">
            <InteractiveCard className="bg-surface/60 backdrop-blur-xl border border-border-subtle p-8 md:p-10 shadow-[0_20px_40px_rgba(17,17,17,0.03)] group transition-all duration-300 relative rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sage-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-sage-green/10 rounded-2xl flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 border border-sage-green/30 rounded-2xl animate-[spin_10s_linear_infinite]"></div>
                <span className="material-symbols-outlined text-[32px] text-sage-green relative z-10">bolt</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-4">
                Zero-Code Deployment
              </h3>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed relative z-10">
                No engineers required. Upload your PDFs, Word documents, or raw text, and your autonomous agent is ready to deploy via a 1-line script.
              </p>
            </InteractiveCard>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={cardVariants} className="w-full">
            <InteractiveCard className="bg-surface/60 backdrop-blur-xl border border-border-subtle p-8 md:p-10 shadow-[0_20px_40px_rgba(17,17,17,0.03)] group transition-all duration-300 relative rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-electric-tangerine/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-electric-tangerine/10 rounded-full blur-[40px] group-hover:bg-electric-tangerine/20 transition-colors duration-500"></div>
              <div className="w-16 h-16 bg-electric-tangerine/10 rounded-2xl flex items-center justify-center mb-8 relative">
                <span className="material-symbols-outlined text-[32px] text-electric-tangerine relative z-10 group-hover:scale-110 transition-transform duration-300">support_agent</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-4 relative z-10">
                24/7 Autonomous Support
              </h3>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed relative z-10">
                Never miss a lead. Your agent operates around the clock, synthesizing answers from your knowledge base instantly without hallucinations.
              </p>
            </InteractiveCard>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={cardVariants} className="w-full">
            <InteractiveCard className="bg-surface/60 backdrop-blur-xl border border-border-subtle p-8 md:p-10 shadow-[0_20px_40px_rgba(17,17,17,0.03)] group transition-all duration-300 relative rounded-2xl overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted-terracotta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-muted-terracotta/10 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="absolute bottom-0 w-full bg-muted-terracotta/20 group-hover:h-full transition-all duration-700 ease-in-out h-1/3"></div>
                <span className="material-symbols-outlined text-[32px] text-muted-terracotta relative z-10">monitoring</span>
              </div>
              <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-4">
                Real-Time Analytics
              </h3>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed relative z-10">
                Track ROI instantly. View comprehensive dashboards covering conversation trends, user sentiment, and data consumption.
              </p>
            </InteractiveCard>
          </motion.div>

        </div>
      </motion.section>
    </div>
  );
}
