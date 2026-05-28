"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

interface AgentStats {
  total_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  total_documents: number;
  total_chunks: number;
}

export default function Analytics({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const supabase = createClient();

  const { data: stats, isLoading, error } = useQuery<AgentStats>({
    queryKey: ["analytics_stats", agentId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/analytics/stats/${agentId}`, {}, session.access_token);
    },
  });

  return (
    <div className="bg-surface-container-lowest border border-border-subtle p-8 md:p-12">
      <h2 className="font-label-mono text-[14px] font-bold uppercase tracking-widest text-charcoal-text mb-8">
        System Telemetry
      </h2>

      {error && (
        <div className="mb-8 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] shrink-0">flag</span>
          <span>Failed to load telemetry data.</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-container h-32 border border-border-subtle p-6"></div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            title="Total Conversations" 
            value={stats.total_conversations} 
            icon="forum"
            color="text-charcoal-text"
          />
          <MetricCard 
            title="Total Messages" 
            value={stats.total_messages} 
            icon="chat"
            color="text-sage-green"
          />
          <MetricCard 
            title="Avg. Messages / Chat" 
            value={(stats.avg_messages_per_conversation ?? 0).toFixed(1)} 
            icon="analytics"
            color="text-electric-tangerine"
          />
          <MetricCard 
            title="Documents Ingested" 
            value={stats.total_documents} 
            icon="description"
            color="text-charcoal-text"
          />
          <MetricCard 
            title="Vector Chunks" 
            value={stats.total_chunks} 
            icon="memory"
            color="text-sage-green"
          />
        </div>
      ) : null}

      <div className="mt-16 pt-8 border-t border-border-subtle">
        <h3 className="font-headline-md text-[20px] font-bold text-charcoal-text mb-2">
          Trend Analysis
        </h3>
        <p className="font-body-md text-on-surface-variant mb-6">
          Graphical analysis module is currently initializing. Raw telemetry data is actively being aggregated.
        </p>
        <div className="h-64 border border-dashed border-border-subtle flex items-center justify-center bg-sand-bg">
          <div className="flex flex-col items-center opacity-50">
            <span className="material-symbols-outlined text-[48px] mb-4">monitoring</span>
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Gathering Matrix Data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-sand-bg border border-border-subtle p-6 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          {title}
        </span>
        <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
      </div>
      <div className="font-headline-lg text-[32px] font-bold text-charcoal-text">
        {value}
      </div>
    </div>
  );
}
