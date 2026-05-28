"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * easeProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, target, duration]);

  const formatted = target % 1 !== 0 
    ? displayValue.toFixed(1) 
    : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

// Hydration-safe static particle coordinates
const PARTICLES = [
  { id: 0, x: 50, y: 50, size: 8, delay: 0 },
  { id: 1, x: 30, y: 35, size: 5, delay: 0.5 },
  { id: 2, x: 70, y: 30, size: 6, delay: 1.2 },
  { id: 3, x: 25, y: 65, size: 4, delay: 2.0 },
  { id: 4, x: 75, y: 60, size: 5, delay: 0.8 },
  { id: 5, x: 40, y: 20, size: 3, delay: 1.5 },
  { id: 6, x: 60, y: 15, size: 4, delay: 2.5 },
  { id: 7, x: 15, y: 50, size: 5, delay: 0.3 },
  { id: 8, x: 85, y: 45, size: 3, delay: 1.8 },
  { id: 9, x: 45, y: 75, size: 6, delay: 2.2 },
  { id: 10, x: 65, y: 80, size: 4, delay: 0.7 },
  { id: 11, x: 35, y: 85, size: 5, delay: 1.1 },
  { id: 12, x: 80, y: 25, size: 3, delay: 2.6 },
  { id: 13, x: 20, y: 80, size: 4, delay: 0.9 },
  { id: 14, x: 90, y: 65, size: 5, delay: 1.4 },
  { id: 15, x: 55, y: 90, size: 3, delay: 0.2 },
  { id: 16, x: 10, y: 30, size: 4, delay: 2.1 },
  { id: 17, x: 95, y: 35, size: 5, delay: 1.7 },
];

// Calculate connections statically
const CONNECTIONS: [number, number][] = [];
for (let i = 0; i < PARTICLES.length; i++) {
  for (let j = i + 1; j < PARTICLES.length; j++) {
    const dx = PARTICLES[i].x - PARTICLES[j].x;
    const dy = PARTICLES[i].y - PARTICLES[j].y;
    if (Math.sqrt(dx * dx + dy * dy) < 35) {
      CONNECTIONS.push([i, j]);
    }
  }
}

export function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center px-margin-mobile md:px-margin-page py-12 md:py-stack-lg max-w-screen-2xl mx-auto relative overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,92,0,0.08)_0%,transparent_70%)] pointer-events-none -z-10"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10 w-full mb-16 md:mb-24 mt-8 md:mt-0">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="md:col-span-7 flex flex-col justify-center relative pt-8 md:pt-0"
        >
          <h1 className="font-display-xl-mobile md:font-display-xl text-[40px] sm:text-[48px] md:text-[72px] lg:text-[84px] font-bold text-charcoal-text leading-[1.05] md:leading-[1.05] mb-6 md:mb-stack-md relative">
            Build AI Agents<br />
            That Actually<br className="hidden md:block" />
            <span className="italic text-muted-terracotta relative inline-block">
              Understand.
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1 bg-electric-tangerine opacity-50 origin-left"
              ></motion.span>
            </span>
          </h1>
          <p className="font-body-lg text-[16px] md:text-[18px] text-on-surface-variant max-w-xl mb-6 md:mb-stack-md border-l-2 border-electric-tangerine pl-6">
            The autonomous SaaS chatbot platform. Train custom AI agents on your data in minutes, 
            and deploy them anywhere with a single line of code.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <a href="/register">
              <MagneticButton className="inline-flex items-center justify-center w-full sm:w-auto bg-electric-tangerine text-white font-label-mono text-[12px] px-8 py-4 rounded-full shadow-[0_8px_24px_rgba(255,92,0,0.35)] hover:shadow-[0_12px_32px_rgba(255,92,0,0.25)] hover:-translate-y-0.5 transition-all duration-300 group">
                Get Started Free
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </MagneticButton>
            </a>
            <a href="/login" className="inline-flex items-center justify-center font-label-mono text-[12px] px-8 py-4 text-charcoal-text border border-border-subtle rounded-full hover:border-charcoal-text transition-all duration-300 bg-surface/50 backdrop-blur">
              Access Dashboard
            </a>
          </div>
        </motion.div>
        
        {/* Neural Constellation Visual */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="md:col-span-5 h-[280px] sm:h-[350px] md:h-full w-full relative z-0 flex items-center justify-center mt-8 md:mt-0"
        >
          <div className="w-full aspect-square relative flex items-center justify-center max-w-[400px]">
            {/* Glowing backdrop */}
            <div className="absolute inset-[15%] rounded-full bg-electric-tangerine/10 blur-[60px]"></div>
            
            {/* SVG Constellation */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              {/* Connection lines */}
              {CONNECTIONS.map(([a, b], i) => (
                <motion.line
                  key={`line-${i}`}
                  x1={PARTICLES[a].x}
                  y1={PARTICLES[a].y}
                  x2={PARTICLES[b].x}
                  y2={PARTICLES[b].y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.05 }}
                />
              ))}
              {/* Particle nodes */}
              {PARTICLES.map((p) => (
                <motion.circle
                  key={`particle-${p.id}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.size / 4}
                  fill={p.id === 0 ? "#FF5C00" : p.id < 5 ? "#7C3AED" : "rgba(255,255,255,0.2)"}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ 
                    duration: 3 + p.delay,
                    repeat: Infinity,
                    delay: p.delay * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {/* Central bright node */}
              <motion.circle
                cx="50"
                cy="50"
                r="3"
                fill="#FF5C00"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="8"
                fill="none"
                stroke="rgba(255,92,0,0.3)"
                strokeWidth="0.5"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            {/* Floating labels */}
            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] right-[10%] bg-surface-container border border-border-subtle px-3 py-1.5 shadow-sm rounded backdrop-blur-md"
            >
              <span className="font-label-mono text-[8px] md:text-[9px] text-charcoal-text uppercase">RAG Engine</span>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 6, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] left-[5%] bg-surface-container border border-border-subtle px-3 py-1.5 shadow-sm rounded backdrop-blur-md"
            >
              <span className="font-label-mono text-[8px] md:text-[9px] text-charcoal-text uppercase">Vector DB</span>
            </motion.div>
            <motion.div 
              animate={{ y: [0, -4, 0] }} 
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-[10%] right-[15%] bg-electric-tangerine text-white px-3 py-1.5 shadow-sm rounded"
            >
              <span className="font-label-mono text-[8px] md:text-[9px] uppercase">LLM Core</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Animated Stats - Full Width Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="w-full flex flex-row justify-around items-center pt-8 md:pt-12 border-t border-border-subtle z-10"
      >
        <div className="text-center">
          <span className="font-headline-md text-[28px] sm:text-[36px] md:text-[48px] font-bold text-charcoal-text block mb-1">
            <AnimatedCounter target={99.7} suffix="%" />
          </span>
          <span className="font-label-mono text-[10px] md:text-[12px] uppercase tracking-widest text-on-surface-variant">Uptime SLA</span>
        </div>
        <div className="text-center">
          <span className="font-headline-md text-[28px] sm:text-[36px] md:text-[48px] font-bold text-charcoal-text block mb-1">
            <AnimatedCounter prefix="<" target={50} suffix="ms" />
          </span>
          <span className="font-label-mono text-[10px] md:text-[12px] uppercase tracking-widest text-on-surface-variant">Avg Latency</span>
        </div>
        <div className="text-center">
          <span className="font-headline-md text-[28px] sm:text-[36px] md:text-[48px] font-bold text-charcoal-text block mb-1">
            <AnimatedCounter target={10000} suffix="+" />
          </span>
          <span className="font-label-mono text-[10px] md:text-[12px] uppercase tracking-widest text-on-surface-variant">Queries / Day</span>
        </div>
      </motion.div>
    </section>
  );
}
