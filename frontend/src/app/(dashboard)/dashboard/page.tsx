"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { fetchApi } from "@/lib/api";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  description?: string;
  welcome_message: string;
  accent_color: string;
  is_active: boolean;
  created_at: string;
  document_count: number;
}

export default function DashboardOverview() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const { data: agents = [], isLoading, error: queryError } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const res = await fetchApi("/api/v1/agents/", {}, session.access_token);
      return (res.agents || []) as Agent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi("/api/v1/agents/", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: "A new intelligent support agent.",
        }),
      }, session.access_token) as Promise<Agent>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setIsCreateModalOpen(false);
      setCreateName("");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    createMutation.mutate(createName);
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border-subtle pb-6 gap-4">
        <div>
          <span className="font-label-mono text-[12px] uppercase tracking-widest text-sage-green mb-2 block">
            Dashboard
          </span>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] font-bold text-charcoal-text">
            Active Agents
          </h1>
        </div>
        <MagneticButton 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-charcoal-text text-sand-bg font-label-mono text-[12px] py-3 px-6 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300"
        >
          + Provision Agent
        </MagneticButton>
      </div>

      {queryError && (
        <div className="mb-8 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3 relative overflow-hidden">
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">flag</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-sand-bg/80 mb-1">Attention Required</span>
            <span>Failed to initialize telemetry. Connection error.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-border-subtle p-6 h-[220px] flex flex-col justify-between animate-pulse">
              <div>
                <div className="w-1/4 h-2 bg-surface-container mb-4 rounded"></div>
                <div className="w-3/4 h-6 bg-surface-container mb-2 rounded"></div>
                <div className="w-full h-4 bg-surface-container rounded"></div>
              </div>
              <div className="w-1/3 h-3 bg-surface-container rounded mt-4"></div>
            </div>
          ))
        ) : agents.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 border border-dashed border-border-subtle p-16 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant">smart_toy</span>
            </div>
            <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-2">No agents detected</h3>
            <p className="text-on-surface-variant font-body-md mb-8 max-w-md">
              Your control center is currently empty. Provision a new intelligent agent to begin orchestrating your knowledge base.
            </p>
            <MagneticButton onClick={() => setIsCreateModalOpen(true)} className="bg-charcoal-text text-sand-bg font-label-mono text-[12px] py-3 px-8">
              Provision First Agent
            </MagneticButton>
          </div>
        ) : (
          <AnimatePresence>
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/agent/${agent.id}`} className="group block h-full">
                  <div className="bg-surface-container-lowest border border-border-subtle p-6 hover:border-charcoal-text transition-colors duration-300 relative h-full flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-0 right-0 w-full h-[2px] bg-electric-tangerine scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-sage-green animate-pulse' : 'bg-on-surface-variant'}`}></span>
                          <span className="font-label-mono text-[10px] uppercase text-on-surface-variant">
                            ID: {agent.id.slice(0, 8)}
                          </span>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm border border-border-subtle" 
                          style={{ backgroundColor: agent.accent_color }}
                          title="Accent Color"
                        />
                      </div>
                      <h3 className="font-headline-md text-[20px] font-bold text-charcoal-text mb-2">
                        {agent.name}
                      </h3>
                      <p className="font-body-md text-[14px] text-on-surface-variant mb-6 line-clamp-2">
                        {agent.description || agent.welcome_message}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-auto">
                      <div className="flex items-center gap-4 font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                        <span className="flex items-center gap-1" title="Documents Ingested">
                          <span className="material-symbols-outlined text-[14px]">database</span>
                          {agent.document_count}
                        </span>
                        <span className="flex items-center gap-1" title="Creation Date">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(agent.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-charcoal-text/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-surface-container-lowest border border-border-subtle p-8 shadow-2xl w-full max-w-md"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-charcoal-text"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <h3 className="font-headline-md text-[24px] font-bold text-charcoal-text mb-2">
                Provision Agent
              </h3>
              <p className="font-body-md text-on-surface-variant mb-6 text-[14px]">
                Initialize a new intelligent agent to orchestrate your knowledge base.
              </p>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Agent Designation
                  </label>
                  <input 
                    type="text" 
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Technical Support Bot"
                    className="w-full bg-sand-bg border border-border-subtle p-3 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
                    autoFocus
                  />
                </div>

                {createMutation.error && (
                  <div className="text-error font-label-mono text-[10px] uppercase tracking-widest">
                    Error: {(createMutation.error as Error).message}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-charcoal-text transition-colors"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    type="submit" 
                    className="bg-charcoal-text text-sand-bg font-label-mono text-[10px] px-6 py-3 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Provisioning..." : "Confirm & Provision"}
                  </MagneticButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
