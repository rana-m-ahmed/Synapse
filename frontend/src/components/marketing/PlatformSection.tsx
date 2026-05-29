"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";

export function PlatformSection() {
  const [copied, setCopied] = useState(false);
  const [chatText, setChatText] = useState("");
  const fullText = "Hello! I am your Synapse agent. How can I help you today?";
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`<script src="https://synapse.com/widget.js"></script>\n<synapse-widget agent="xyz"></synapse-widget>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
  };

  return (
    <section ref={sectionRef} id="platform" className="py-stack-xl px-margin-mobile md:px-margin-page bg-surface-container-lowest relative z-10 overflow-hidden">
      
      {/* Animated floating background elements */}
      <motion.div style={{ y: y1 }} className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] bg-electric-tangerine/5 rounded-full blur-[100px] pointer-events-none"></motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-[10%] -right-[10%] w-[30vw] h-[30vw] bg-sage-green/5 rounded-full blur-[80px] pointer-events-none"></motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-screen-2xl mx-auto relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-stack-lg text-center max-w-3xl mx-auto">
          <span className="font-label-mono text-[12px] uppercase tracking-widest text-sage-green mb-4 block">
            Platform Architecture
          </span>
          <h2 className="font-headline-lg text-[32px] md:text-[48px] font-semibold text-charcoal-text mb-6">
            Complete Control.
          </h2>
          <p className="font-body-md text-[18px] text-on-surface-variant">
            An end-to-end suite designed to help you build, train, and deploy intelligent agents without the friction of traditional infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* 1. Agent Control Center Card (Spans 7 cols) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-7 bg-surface-container border border-border-subtle rounded-2xl p-8 md:p-10 group hover:border-electric-tangerine transition-all duration-500 flex flex-col shadow-lg hover:shadow-[0_0_40px_rgba(255,92,0,0.1)] overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-tangerine/10 rounded-full blur-[30px] -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full aspect-[16/9] bg-surface-container-lowest border border-border-subtle rounded-xl mb-8 flex flex-col overflow-hidden shadow-2xl relative z-10"
            >
              {/* Window Controls */}
              <div className="h-8 border-b border-border-subtle bg-surface flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-border-subtle group-hover:bg-error transition-colors"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-border-subtle group-hover:bg-electric-tangerine transition-colors"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-border-subtle group-hover:bg-sage-green transition-colors"></div>
                <span className="font-label-mono text-[9px] text-on-surface-variant ml-2">/dashboard/agents</span>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-3">
                {/* Mock Table Header */}
                <div className="grid grid-cols-3 border-b border-border-subtle pb-2">
                  <span className="font-label-mono text-[9px] uppercase text-on-surface-variant">Agent Name</span>
                  <span className="font-label-mono text-[9px] uppercase text-on-surface-variant">Status</span>
                  <span className="font-label-mono text-[9px] uppercase text-on-surface-variant">Documents</span>
                </div>
                {/* Mock Table Rows */}
                <motion.div whileHover={{ x: 5 }} className="grid grid-cols-3 items-center py-2 border-b border-surface-container group-hover:bg-surface-container/50 transition-colors rounded px-1 cursor-default">
                  <span className="font-body-md text-[12px] text-charcoal-text font-medium">Support_Bot_v2</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></span>
                    <span className="font-label-mono text-[10px] text-sage-green">Active</span>
                  </div>
                  <span className="font-label-mono text-[10px] text-on-surface-variant">12 files</span>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} className="grid grid-cols-3 items-center py-2 border-b border-surface-container group-hover:bg-surface-container/50 transition-colors rounded px-1 cursor-default">
                  <span className="font-body-md text-[12px] text-charcoal-text font-medium">Sales_Lead_Gen</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-electric-tangerine"></span>
                    <span className="font-label-mono text-[10px] text-electric-tangerine">Training</span>
                  </div>
                  <span className="font-label-mono text-[10px] text-on-surface-variant">3 files</span>
                </motion.div>
              </div>
            </motion.div>
            <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3 relative z-10">
              Agent Control Center
            </h3>
            <p className="font-body-md text-on-surface-variant relative z-10">
              Provision and manage a fleet of specialized AI agents from a centralized dashboard. Monitor states and configure system personas.
            </p>
          </motion.div>

          {/* 2. RAG Knowledge Base Card (Spans 5 cols) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-5 bg-surface-container border border-border-subtle rounded-2xl p-8 md:p-10 group hover:border-sage-green transition-all duration-500 flex flex-col shadow-lg hover:shadow-[0_0_40px_rgba(0,255,163,0.1)] overflow-hidden relative"
          >
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-sage-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full aspect-square md:aspect-auto md:flex-1 bg-surface-container-lowest border border-border-subtle rounded-xl mb-8 flex flex-col overflow-hidden shadow-2xl relative p-6 z-10"
            >
              {/* Drag and Drop Zone Mockup */}
              <div className="border-2 border-dashed border-border-subtle group-hover:border-sage-green group-hover:bg-sage-green/5 transition-all duration-500 rounded-xl flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[150px]">
                <motion.span 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-sage-green transition-colors mb-3"
                >
                  cloud_upload
                </motion.span>
                <span className="font-body-md text-[14px] text-charcoal-text">Drag & drop files here</span>
                <span className="font-label-mono text-[10px] text-on-surface-variant mt-1">PDF, DOCX, TXT</span>
                
                {/* Upload Progress Animation */}
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-sage-green opacity-0 group-hover:opacity-100"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                />
              </div>
              {/* File List Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between p-3 bg-surface border border-border-subtle rounded-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-[16px] text-muted-terracotta shrink-0">picture_as_pdf</span>
                  <span className="font-label-mono text-[10px] text-charcoal-text truncate">business_logic.pdf</span>
                </div>
                <span className="font-label-mono text-[9px] text-sage-green bg-sage-green/10 px-2 py-0.5 rounded-full shrink-0">Indexed</span>
              </motion.div>
            </motion.div>
            <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3 relative z-10">
              RAG Knowledge Base
            </h3>
            <p className="font-body-md text-on-surface-variant relative z-10">
              Ingest raw text. The engine automatically chunks and embeds your data into a vector database.
            </p>
          </motion.div>

          {/* 3. Playground Card (Spans 5 cols) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-5 bg-surface-container border border-border-subtle rounded-2xl p-8 md:p-10 group hover:border-muted-terracotta transition-all duration-500 flex flex-col shadow-lg hover:shadow-[0_0_40px_rgba(124,58,237,0.1)] relative overflow-hidden" 
            onMouseEnter={() => {
              let i = 0;
              setChatText("");
              const interval = setInterval(() => {
                if (i < fullText.length) {
                  setChatText((prev) => prev + fullText.charAt(i));
                  i++;
                } else {
                  clearInterval(interval);
                }
              }, 30);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-muted-terracotta/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full aspect-square md:aspect-auto md:flex-1 bg-surface-container-lowest border border-border-subtle rounded-xl mb-8 flex flex-col overflow-hidden shadow-2xl relative z-10"
            >
              <div className="h-10 border-b border-border-subtle bg-surface flex items-center justify-between px-4">
                 <span className="font-label-mono text-[10px] uppercase text-charcoal-text flex items-center gap-2">
                   <span className="material-symbols-outlined text-[14px]">science</span>
                   Live Playground
                 </span>
                 <span className="font-label-mono text-[9px] text-on-surface-variant">llama-3.3-70b</span>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-end space-y-3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] min-h-[150px]">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="self-end max-w-[90%] bg-surface border border-border-subtle text-charcoal-text p-3 rounded-tl-xl rounded-br-xl rounded-bl-xl font-body-md text-[12px] shadow-sm"
                >
                  Can you reset my password?
                </motion.div>
                <div className="self-start max-w-[90%] bg-muted-terracotta/10 border border-muted-terracotta/20 text-charcoal-text p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl font-body-md text-[12px] min-h-[44px] shadow-sm">
                  {chatText}
                  <span className="w-1.5 h-3.5 bg-muted-terracotta inline-block ml-1 animate-pulse align-middle"></span>
                </div>
              </div>
            </motion.div>
            <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3 relative z-10">
              Live Playground
            </h3>
            <p className="font-body-md text-on-surface-variant relative z-10">
              Test your agent's responses in real-time with lightning-fast SSE streaming before deploying.
            </p>
          </motion.div>

          {/* 4. Integration Card (Spans 7 cols) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-7 bg-surface-container border border-border-subtle rounded-2xl p-8 md:p-10 group hover:border-electric-tangerine transition-all duration-500 flex flex-col shadow-lg hover:shadow-[0_0_40px_rgba(255,92,0,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-electric-tangerine/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/4 group-hover:scale-150 transition-transform duration-1000"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full aspect-[16/9] bg-[#0A0A0A] border border-border-subtle rounded-xl mb-8 flex flex-col overflow-hidden shadow-2xl relative text-white font-mono z-10"
            >
              <div className="h-8 border-b border-[#27272A] bg-[#141414] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
                <span className="font-label-mono text-[9px] text-[#A1A1AA] ml-2">index.html</span>
              </div>
              <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-center">
                <div className="text-[#A1A1AA] text-[10px] absolute left-2 top-0 bottom-0 pt-5 flex flex-col text-right pr-2 border-r border-[#27272A] select-none h-full">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
                <pre className="font-label-mono text-[11px] leading-[1.8] overflow-x-auto pl-6">
                  <code>
                    <span className="text-[#A1A1AA]">&lt;!-- Paste this before &lt;/body&gt; --&gt;</span><br/>
                    <span className="text-[#FF5C00]">&lt;script</span> <span className="text-[#00FFA3]">src</span>=<span className="text-[#7C3AED]">"https://synapse.com/widget.js"</span><span className="text-[#FF5C00]">&gt;&lt;/script&gt;</span><br/>
                    <span className="text-[#FF5C00]">&lt;synapse-widget</span><br/>
                    &nbsp;&nbsp;<span className="text-[#00FFA3]">agent-id</span>=<span className="text-[#7C3AED]">"ag_8f72k9"</span><br/>
                    <span className="text-[#FF5C00]">&gt;&lt;/synapse-widget&gt;</span>
                  </code>
                </pre>
                <div 
                  className="absolute bottom-4 right-4 flex items-center gap-2 cursor-pointer bg-[#27272A] hover:bg-[#3F3F46] px-3 py-1.5 rounded text-white transition-colors z-10 shadow-lg"
                  onClick={handleCopy}
                >
                  <span className="font-label-mono text-[10px] uppercase">{copied ? "Copied" : "Copy"}</span>
                  <span className="material-symbols-outlined text-[14px]">{copied ? "check" : "content_copy"}</span>
                </div>
              </div>
            </motion.div>
            <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3 relative z-10">
              1-Line Deployment
            </h3>
            <p className="font-body-md text-on-surface-variant relative z-10">
              Once your agent is trained, deploy it instantly to any website using a secure, isolated Web Component snippet. No complex configurations.
            </p>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
