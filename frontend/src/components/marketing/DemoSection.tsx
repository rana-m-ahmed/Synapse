"use client";

import { useState, useRef, useEffect } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 p-2 px-4">
    <motion.div
      className="w-1.5 h-1.5 bg-electric-tangerine rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-electric-tangerine rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-electric-tangerine rounded-full"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

export function DemoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am the Synapse Intelligence Agent. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const AGENT_ID = "dea0a96d-ebf7-45e5-b627-089db6df99d7";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${baseUrl}/api/v1/widget/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          session_id: sessionId,
          message: userMessage,
        })
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let aiMessage = "";
        let buffer = "";
        let currentEvent = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                
                if (currentEvent === "token" && parsed.token) {
                  aiMessage += parsed.token;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiMessage;
                    return newMessages;
                  });
                } else if (currentEvent === "done") {
                  setIsStreaming(false);
                } else if (currentEvent === "error") {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = "Error: " + (parsed.message || "Unknown error");
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", dataStr, e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Connection error. Ensure the backend is running.";
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <section id="demo" className="py-stack-xl px-margin-mobile md:px-margin-page bg-surface relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] z-20">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-surface-container-lowest to-transparent opacity-80 pointer-events-none"></div>

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
        
        <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center z-10">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div 
                key="chat-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className="w-full bg-surface-container-lowest shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col h-[450px] z-20 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-border-subtle/50 flex justify-between items-center bg-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-electric-tangerine/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-electric-tangerine">smart_toy</span>
                    </span>
                    <span className="font-label-mono text-[12px] font-bold text-charcoal-text">
                      Synapse Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse"></span>
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="text-on-surface-variant hover:text-charcoal-text transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
                      aria-label="Close chat"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col bg-surface-container-lowest/50 scroll-smooth">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                      const isUser = msg.role === "user";
                      const isWaitingForAI = !isUser && msg.content === "" && isStreaming;

                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] p-3 md:p-4 font-body-md text-[14px] md:text-[15px] shadow-sm ${
                            isUser 
                              ? "bg-electric-tangerine text-white rounded-tl-xl rounded-br-xl rounded-bl-xl" 
                              : "bg-surface-container border border-border-subtle/50 text-charcoal-text rounded-tr-xl rounded-br-xl rounded-bl-xl"
                          }`}>
                            {isWaitingForAI ? <TypingIndicator /> : msg.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-border-subtle/50 bg-surface flex items-center gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isStreaming}
                    className="flex-1 bg-surface-container-lowest border border-border-subtle/50 rounded-full px-4 py-3 focus:ring-1 focus:ring-electric-tangerine focus:outline-none font-body-md text-[14px] text-charcoal-text disabled:opacity-50"
                    placeholder="Type a message..."
                    type="text"
                  />
                  <button 
                    type="submit"
                    disabled={isStreaming || !input.trim()}
                    className="w-10 h-10 rounded-full bg-charcoal-text text-white flex items-center justify-center hover:bg-electric-tangerine transition-colors disabled:opacity-50 disabled:hover:bg-charcoal-text shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="chat-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="z-30 mt-4"
              >
                <MagneticButton 
                  onClick={() => setIsOpen(true)}
                  className="bg-electric-tangerine text-white px-8 py-4 rounded-full font-label-mono text-[12px] uppercase tracking-wider flex items-center gap-3 shadow-[0_8px_24px_rgba(255,92,0,0.35)] hover:shadow-[0_12px_32px_rgba(255,92,0,0.45)] transition-all duration-300"
                >
                  <span className="material-symbols-outlined">forum</span>
                  Interact Live
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,92,0,0.03)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80 pointer-events-none"></div>
    </section>
  );
}
