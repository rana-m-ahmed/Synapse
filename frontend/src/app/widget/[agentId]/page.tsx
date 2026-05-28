"use client";

import { useState, useRef, useEffect, use } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WidgetPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agent_id: agentId,
          session_id: sessionId,
          message: userMessage,
          stream: true
        })
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let aiMessage = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  aiMessage += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiMessage;
                    return newMessages;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Connection lost.";
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-0 right-0 p-6 flex flex-col items-end z-50">
        <MagneticButton 
          onClick={() => setIsOpen(true)}
          className="bg-charcoal-text text-sand-bg px-8 py-4 rounded-full font-label-mono text-[12px] flex items-center gap-3 shadow-[0_10px_40px_rgba(17,17,17,0.2)] hover:bg-transparent hover:text-charcoal-text hover:bg-surface-container-lowest transition-colors border border-charcoal-text duration-300"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          Initialize Support
        </MagneticButton>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-surface-container-lowest border border-border-subtle shadow-[0_30px_60px_rgba(17,17,17,0.1)] flex flex-col z-50 transform transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-bottom-right">
      <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-sand-bg">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sage-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-green"></span>
          </span>
          <span className="font-label-mono text-[12px] font-bold text-charcoal-text uppercase tracking-widest">
            Synapse Support Node
          </span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-charcoal-text transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
        <div className="flex justify-start">
          <div className="max-w-[85%] p-4 bg-surface-container border border-border-subtle text-charcoal-text rounded-tr-xl rounded-br-xl rounded-bl-xl font-body-md text-[14px]">
            Node connection established. How may I assist you?
          </div>
        </div>
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-4 ${
              msg.role === "user" 
                ? "bg-charcoal-text text-sand-bg rounded-tl-xl rounded-br-xl rounded-bl-xl" 
                : "bg-surface-container border border-border-subtle text-charcoal-text rounded-tr-xl rounded-br-xl rounded-bl-xl"
            }`}>
              <p className="font-body-md text-[14px] whitespace-pre-wrap">{msg.content}</p>
              {msg.content === "" && isStreaming && (
                <span className="inline-block w-2 h-4 bg-charcoal-text animate-pulse"></span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border-subtle bg-sand-bg flex items-center gap-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Transmit..."
          className="flex-1 bg-transparent border-none font-body-md text-[14px] focus:outline-none placeholder:text-on-surface-variant/50"
        />
        <button 
          type="submit"
          disabled={isStreaming}
          className="text-charcoal-text hover:text-electric-tangerine transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  );
}
