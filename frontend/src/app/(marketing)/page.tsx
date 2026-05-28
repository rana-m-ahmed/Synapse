"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const yNav = useTransform(scrollY, [0, 100], [0, -100]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* TopNavBar */}
      <motion.header
        style={{ y: yNav }}
        className="docked full-width top-0 z-40 bg-sand-bg/90 backdrop-blur-md border-b border-border-subtle sticky transition-transform duration-500"
      >
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-page py-6 md:py-8 max-w-screen-2xl mx-auto">
          <a
            className="font-headline-md text-[32px] font-medium tracking-tighter text-charcoal-text"
            href="#"
          >
            Synapse
          </a>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Features</a>
            <a href="#platform" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Platform</a>
            <a href="#demo" className="text-on-surface-variant font-label-mono text-[12px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-300">Live Demo</a>
          </nav>
          <a href="/login" className="hidden md:inline-flex bg-charcoal-text text-sand-bg font-label-mono text-[12px] px-6 py-3 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 magnetic">
            Login
          </a>
          <button className="md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="min-h-[870px] flex items-center px-margin-mobile md:px-margin-page py-stack-lg max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:col-span-7 flex flex-col justify-center z-10 relative pt-12 md:pt-0"
          >
            <h1 className="font-display-xl-mobile md:font-display-xl text-[48px] md:text-[84px] font-bold text-charcoal-text leading-tight md:leading-tight mb-stack-md">
              Support,<br />
              <span className="italic text-muted-terracotta relative inline-block">
                evolved.
                <motion.span 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 w-full h-1 bg-electric-tangerine opacity-50 origin-left"
                ></motion.span>
              </span>
            </h1>
            <p className="font-body-lg text-[18px] text-on-surface-variant max-w-xl mb-stack-md border-l-2 border-sage-green pl-6">
            The intelligent SaaS chatbot platform. Train custom AI agents on your data in minutes, 
            and deploy them anywhere with a single line of code.
            </p>
            <div className="flex gap-4 items-center">
              <a href="/register">
                <MagneticButton className="inline-flex items-center justify-center bg-charcoal-text text-sand-bg font-label-mono text-[12px] px-8 py-4 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 group">
                  Try It Now
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </MagneticButton>
              </a>
              <a href="/login" className="inline-flex items-center justify-center font-label-mono text-[12px] px-8 py-4 text-charcoal-text hover:text-electric-tangerine transition-colors duration-300">
                Login
              </a>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="md:col-span-5 h-[400px] md:h-full w-full relative z-0 flex items-center justify-center mt-stack-md md:mt-0"
          >
            <div className="w-full aspect-square bg-surface-container-lowest border border-border-subtle rounded shadow-[0_20px_50px_rgba(17,17,17,0.04)] relative overflow-hidden group">
              <img
                alt="Abstract kinetic wireframe"
                className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9J9qfSZiNcGPfgTfCUeS6HclPr7pyKr1cnfd5tSVG8NXn_xp3bi8lytDMAwQgXbtWlnQVZOFlpgied0owfR_2WZ0kIy7rbTb67WF1NNrww7lZTozrs5ekNXW2NQ6akq85glS5BcErgQiwrMV151pYmzfvtMCOEsaMwIIu0GTSNt1wynD8RPPArz2faWfRO_IT22-QRRjeFBAQpfCXgpaKHxYCWMjILVrR6r5a2O-BLnB5F9zNRaWGf9NO2prF_kFS8xDjIm6N8cw"
              />
              <div className="absolute inset-0 border-t-[2px] border-electric-tangerine opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>
        </section>

        {/* Staggered Features */}
        <div id="features" className="relative bg-sand-bg z-10">
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 1, staggerChildren: 0.2 } }
            }}
            className="py-stack-xl px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto relative border-t border-border-subtle bg-sand-bg"
          >
            <div className="w-full">
              <div className="mb-stack-lg">
                <span className="font-label-mono text-[12px] uppercase tracking-widest text-muted-terracotta mb-4 block">
                  Architecture
                </span>
                <h2 className="font-headline-lg text-[32px] md:text-[48px] font-semibold text-charcoal-text">
                  Contextual Routing.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                {/* Feature 1 */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="md:col-span-5 md:col-start-2 bg-surface-container-lowest border border-border-subtle p-8 md:p-12 shadow-[0_10px_30px_rgba(17,17,17,0.02)] relative group hover:border-charcoal-text transition-colors duration-300 transform hover:-translate-y-2 spring-ease"
                >
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-sage-green opacity-20 rounded-full group-hover:scale-150 transition-transform duration-500 spring-ease"></div>
                  <h3 className="font-label-mono text-[12px] font-bold text-charcoal-text mb-4">
                    Persistent Memory
                  </h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant mb-8">
                    The engine recalls past interactions, eliminating repetitive
                    questions. Each dialogue builds upon the last, creating a seamless
                    narrative.
                  </p>
                  <div className="bg-sand-bg border border-border-subtle p-4 font-label-mono text-xs overflow-x-auto">
                    <pre className="text-on-surface-variant">
                      <code>
                        <span className="text-muted-terracotta">const</span> context =
                        synapse.<span className="text-electric-tangerine">recall</span>
                        (userId);
                        {"\n"}
                        <span className="text-muted-terracotta">if</span> (context.intent
                        === <span className="text-sage-green">'upgrade'</span>) {"{"}
                        {"\n"}  routeToPremium(context);{"\n"}
                        {"}"}
                      </code>
                    </pre>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="md:col-span-6 md:col-start-8 mt-stack-md md:mt-32 bg-surface-container-lowest border border-border-subtle p-8 md:p-12 shadow-[0_10px_30px_rgba(17,17,17,0.02)] relative group hover:border-charcoal-text transition-colors duration-300 transform hover:-translate-y-2 spring-ease"
                >
                  <div className="absolute top-0 right-0 w-full h-[2px] bg-electric-tangerine scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                  <h3 className="font-label-mono text-[12px] font-bold text-charcoal-text mb-4">
                    Tactile Interface
                  </h3>
                  <p className="font-body-md text-[16px] text-on-surface-variant mb-8">
                    Raw UI components designed for visceral feedback. Precision controls
                    that feel physical, breaking the monotony of standard web forms.
                  </p>
                  <div className="space-y-6 bg-sand-bg p-6 border border-border-subtle">
                    <div>
                      <div className="flex justify-between font-label-mono text-[10px] uppercase mb-2 text-charcoal-text">
                        <span>Empathy Level</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full h-[2px] bg-border-subtle relative">
                        <div className="absolute left-0 top-0 h-full bg-charcoal-text w-[85%] group-hover:w-[95%] transition-all duration-1000 spring-ease"></div>
                        <div className="absolute left-[85%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 bg-surface border border-charcoal-text cursor-ew-resize hover:bg-electric-tangerine hover:border-electric-tangerine transition-colors group-hover:left-[95%] duration-1000 spring-ease"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-label-mono text-[10px] uppercase mb-2 text-charcoal-text">
                        <span>Response Latency</span>
                        <span>12ms</span>
                      </div>
                      <div className="w-full h-[2px] bg-border-subtle relative">
                        <div className="absolute left-0 top-0 h-full bg-muted-terracotta w-[15%] group-hover:w-[5%] transition-all duration-1000 spring-ease"></div>
                        <div className="absolute left-[15%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 bg-surface border border-charcoal-text cursor-ew-resize group-hover:left-[5%] transition-all duration-1000 spring-ease"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Platform Capabilities Showcase */}
        <section id="platform" className="py-stack-xl px-margin-mobile md:px-margin-page bg-surface-container-lowest relative z-10 border-t border-border-subtle">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-stack-lg text-center max-w-3xl mx-auto">
              <span className="font-label-mono text-[12px] uppercase tracking-widest text-sage-green mb-4 block">
                Platform Architecture
              </span>
              <h2 className="font-headline-lg text-[32px] md:text-[48px] font-semibold text-charcoal-text mb-6">
                Complete Control.
              </h2>
              <p className="font-body-md text-[18px] text-on-surface-variant">
                An end-to-end suite designed to help you build, train, and deploy intelligent agents without the friction of traditional infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Agent Dashboard Card */}
              <div className="bg-sand-bg border border-border-subtle p-8 md:p-10 group hover:border-charcoal-text transition-all duration-500">
                <div className="w-full aspect-[4/3] bg-surface-container-lowest border border-border-subtle mb-8 flex flex-col p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay"></div>
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-4">
                    <span className="font-label-mono text-[10px] uppercase text-charcoal-text">Dashboard</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-24 bg-surface border border-border-subtle group-hover:-translate-y-1 transition-transform duration-300"></div>
                    <div className="flex-1 h-24 bg-surface border border-border-subtle group-hover:-translate-y-2 transition-transform duration-300 delay-100"></div>
                    <div className="flex-1 h-24 bg-surface border border-dashed border-border-subtle group-hover:bg-electric-tangerine/10 transition-colors duration-300 delay-200"></div>
                  </div>
                </div>
                <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3">
                  Agent Control Center
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  Provision and manage a fleet of specialized AI agents from a centralized, minimalist dashboard. Monitor states and configure system personas.
                </p>
              </div>

              {/* RAG Knowledge Base Card */}
              <div className="bg-sand-bg border border-border-subtle p-8 md:p-10 group hover:border-charcoal-text transition-all duration-500">
                <div className="w-full aspect-[4/3] bg-surface-container-lowest border border-border-subtle mb-8 flex flex-col p-4 shadow-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay"></div>
                   <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-4">
                    <span className="font-label-mono text-[10px] uppercase text-charcoal-text">Memory Banks</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-8 border border-border-subtle flex items-center px-2">
                      <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></div>
                      <div className="w-32 h-2 bg-charcoal-text/20 ml-2"></div>
                    </div>
                    <div className="w-full h-8 border border-border-subtle flex items-center px-2">
                      <div className="w-2 h-2 rounded-full bg-sage-green"></div>
                      <div className="w-48 h-2 bg-charcoal-text/20 ml-2"></div>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-border-subtle">
                    <div className="w-full h-8 border border-border-dashed flex items-center justify-center text-[10px] font-label-mono uppercase text-on-surface-variant group-hover:bg-sage-green/10 transition-colors">
                      Upload Document
                    </div>
                  </div>
                </div>
                <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3">
                  Retrieval-Augmented Generation
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  Ingest raw text and documents. The engine automatically chunks, embeds, and indexes your data into a high-performance vector database.
                </p>
              </div>

              {/* Playground Card */}
              <div className="bg-sand-bg border border-border-subtle p-8 md:p-10 group hover:border-charcoal-text transition-all duration-500">
                <div className="w-full aspect-[4/3] bg-surface-container-lowest border border-border-subtle mb-8 flex flex-col p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay"></div>
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-4">
                    <span className="font-label-mono text-[10px] uppercase text-charcoal-text">Playground</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-end space-y-2">
                    <div className="self-end w-24 h-6 bg-charcoal-text rounded-tl-md rounded-br-md rounded-bl-md group-hover:scale-105 transition-transform origin-bottom-right"></div>
                    <div className="self-start w-32 h-6 bg-surface border border-border-subtle rounded-tr-md rounded-br-md rounded-bl-md group-hover:scale-105 transition-transform origin-bottom-left delay-100"></div>
                  </div>
                </div>
                <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3">
                  Live Playground
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  Test your agent's responses in real-time. Experience lightning-fast token streaming powered by Server-Sent Events (SSE).
                </p>
              </div>

              {/* Integration Card */}
              <div className="bg-sand-bg border border-border-subtle p-8 md:p-10 group hover:border-charcoal-text transition-all duration-500">
                <div className="w-full aspect-[4/3] bg-surface-container-lowest border border-border-subtle mb-8 flex flex-col p-4 shadow-sm relative overflow-hidden bg-charcoal-text text-sand-bg">
                  <div className="flex justify-between items-center border-b border-surface-container/20 pb-2 mb-4">
                    <span className="font-label-mono text-[10px] uppercase">Integration</span>
                  </div>
                  <pre className="font-label-mono text-[8px] sm:text-[10px] opacity-70 mt-4 group-hover:opacity-100 transition-opacity">
                    <code>
                      &lt;iframe<br/>
                      &nbsp;&nbsp;src="https://synapse.com/widget/agent_xyz"<br/>
                      &nbsp;&nbsp;style="position: fixed; bottom: 20px;"<br/>
                      &gt;&lt;/iframe&gt;
                    </code>
                  </pre>
                  <div className="mt-auto self-end text-electric-tangerine group-hover:-translate-y-2 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">content_copy</span>
                  </div>
                </div>
                <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-3">
                  1-Line Deployment
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  Once your agent is trained, deploy it instantly to any website using a secure, isolated IFrame widget snippet. No complex configurations.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Widget Reveal */}
        <section id="demo" className="py-stack-xl px-margin-mobile md:px-margin-page bg-surface-container-lowest border-y border-border-subtle relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] z-20">
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-stack-md z-10">
              <h2 className="font-headline-md text-[32px] text-charcoal-text mb-4">
                General Intelligence.
              </h2>
              <p className="font-body-md text-[18px] text-on-surface-variant mb-8 max-w-md">
                Synapse isn't just another generic bot. It deeply understands your business logic, 
                API documentation, and customer context out of the box.
              </p>
            </div>
            {/* The Widget Container */}
            <div className="relative w-full max-w-md mx-auto h-[400px] flex items-end justify-center group z-10">
              {/* Expanded Chat */}
              <div className="absolute bottom-0 w-full bg-surface border border-border-subtle shadow-[0_30px_60px_rgba(17,17,17,0.08)] opacity-0 scale-95 translate-y-8 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-700 spring-ease flex flex-col h-full z-20 origin-bottom">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-sand-bg">
                  <span className="font-label-mono text-[12px] font-bold">
                    Synapse Assistant
                  </span>
                  <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></span>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
                  <div className="self-start max-w-[85%] transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300 spring-ease">
                    <p className="font-body-md text-[16px] text-on-surface-variant bg-surface-container p-4 border border-border-subtle rounded-tr-xl rounded-br-xl rounded-bl-xl">
                      Welcome back. I notice you were looking at the API documentation yesterday. Need help implementing the webhooks?
                    </p>
                    <span className="font-label-mono text-[10px] text-on-surface-variant mt-2 block">10:42 AM</span>
                  </div>
                  <div className="self-end max-w-[85%] transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-500 spring-ease">
                    <p className="font-body-md text-[16px] text-sand-bg bg-charcoal-text p-4 rounded-tl-xl rounded-br-xl rounded-bl-xl">
                      Yes, exactly. I'm getting a 401 error.
                    </p>
                    <span className="font-label-mono text-[10px] text-on-surface-variant mt-2 block text-right">10:43 AM</span>
                  </div>
                  <div className="self-start max-w-[85%] relative transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-700 spring-ease">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-tangerine origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-1000"></div>
                    <p className="font-body-md text-[16px] text-on-surface-variant bg-surface-container p-4 border border-border-subtle rounded-tr-xl rounded-br-xl rounded-bl-xl mt-2">
                      Ah, a 401. Let's check your authentication headers. Ensure you're passing the Bearer token correctly. Here's a snippet:
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-border-subtle bg-sand-bg flex items-center">
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-[16px] placeholder:text-on-surface-variant/50 outline-none"
                    placeholder="Type a message..."
                    type="text"
                  />
                  <button className="text-charcoal-text hover:text-electric-tangerine transition-colors">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
              {/* The Pill Button */}
              <MagneticButton className="bg-charcoal-text text-sand-bg px-8 py-4 rounded-full font-label-mono text-[12px] flex items-center gap-3 shadow-lg group-hover:opacity-0 group-hover:scale-90 group-hover:-translate-y-4 transition-all duration-500 spring-ease absolute bottom-0 z-30">
                <span className="material-symbols-outlined">chat_bubble</span>
                Test Widget
              </MagneticButton>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,92,0,0.03)_0%,transparent_70%)] pointer-events-none"></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full pt-stack-xl pb-stack-md border-t border-border-subtle bg-sand-bg relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto">
          <div className="md:col-span-6 flex flex-col justify-between">
            <span className="font-label-mono text-[12px] font-bold text-charcoal-text mb-8">
              Synapse
            </span>
            <p className="font-body-md text-[16px] text-on-surface-variant max-w-sm mb-8 md:mb-0">
              General Intelligent SaaS Chatbot.
            </p>
          </div>
          <div className="md:col-span-6 flex flex-col md:items-end justify-between">
            <nav className="flex flex-wrap gap-6 md:gap-8 mb-8 md:mb-0">
              <a href="/login" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
                Login
              </a>
              <a href="/register" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
                Sign Up
              </a>
              <a href="/dashboard" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
                Dashboard
              </a>
            </nav>
            <span className="font-body-md text-[16px] text-on-surface-variant opacity-60">
              © 2026 Synapse Engine.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
