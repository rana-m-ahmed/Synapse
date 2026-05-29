"use client";

import { useState, useRef, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
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

export default function Playground({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          agent_id: agentId,
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
          if (done) {
            break;
          }
          
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
        newMessages[newMessages.length - 1].content = "Error: Connection lost or request failed.";
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-sand-bg border border-border-subtle flex flex-col h-[700px] relative overflow-hidden shadow-[0_20px_50px_rgba(17,17,17,0.04)]">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest z-10 relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-tangerine"></div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-electric-tangerine/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-electric-tangerine">smart_toy</span>
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-charcoal-text">Playground Console</h2>
            <span className="font-label-mono text-[10px] uppercase text-on-surface-variant flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-green"></span>
              </span>
              Agent Online
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-sand-bg/50 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <span className="material-symbols-outlined text-[48px] text-charcoal-text mb-4">forum</span>
            <p className="font-body-md text-charcoal-text max-w-xs">
              Send a message to test your agent's knowledge base and fallback responses.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isWaitingForAI = !isUser && msg.content === "" && isStreaming;

              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Avatar */}
                    <div className="shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isUser ? "bg-charcoal-text text-sand-bg" : "bg-electric-tangerine/10 text-electric-tangerine border border-electric-tangerine/20"
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {isUser ? "person" : "smart_toy"}
                        </span>
                      </div>
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 md:p-5 shadow-sm ${
                      isUser 
                        ? "bg-charcoal-text text-sand-bg rounded-tl-2xl rounded-br-2xl rounded-bl-2xl" 
                        : "bg-surface-container-lowest border border-border-subtle text-charcoal-text rounded-tr-2xl rounded-br-2xl rounded-bl-2xl"
                    }`}>
                      {isWaitingForAI ? (
                        <TypingIndicator />
                      ) : (
                        <p className="font-body-md whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-surface-container-lowest border-t border-border-subtle relative z-10">
        <form onSubmit={handleSend} className="relative flex items-center group max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-sand-bg border border-border-subtle rounded-full py-4 pl-6 pr-16 font-body-md text-charcoal-text focus:outline-none focus:border-electric-tangerine transition-all shadow-sm focus:shadow-md"
            disabled={isStreaming}
          />
          <button 
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-charcoal-text text-sand-bg rounded-full flex items-center justify-center hover:bg-electric-tangerine transition-colors disabled:opacity-50 disabled:hover:bg-charcoal-text"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="font-label-mono text-[10px] text-on-surface-variant">
            AI can make mistakes. Verify important information.
          </span>
        </div>
      </div>
    </div>
  );
}
