"use client";

import { motion } from "framer-motion";

export function FeaturesSection() {
  return (
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
  );
}
