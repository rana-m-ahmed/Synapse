"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AgentStats {
  total_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  total_documents: number;
  total_chunks: number;
}

interface DailyTrend {
  date: string;
  count: number;
}

export default function Analytics({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const supabase = createClient();

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<AgentStats>({
    queryKey: ["analytics_stats", agentId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/analytics/stats/${agentId}`, {}, session.access_token);
    },
  });

  const { data: trendResponse, isLoading: isLoadingTrend } = useQuery<{ data: DailyTrend[] }>({
    queryKey: ["analytics_trend", agentId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/analytics/trend/${agentId}`, {}, session.access_token);
    },
  });

  return (
    <div className="bg-surface-container-lowest border border-border-subtle p-8 md:p-12">
      <h2 className="font-label-mono text-[14px] font-bold uppercase tracking-widest text-charcoal-text mb-8">
        System Telemetry
      </h2>

      {statsError && (
        <div className="mb-8 p-4 bg-error text-white font-body-md shadow-lg flex items-start gap-3 rounded">
          <span className="material-symbols-outlined text-[20px] shrink-0">flag</span>
          <span>Failed to load telemetry data.</span>
        </div>
      )}

      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-container h-32 border border-border-subtle p-6 rounded-lg"></div>
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
          Daily conversation volume over the last 30 days.
        </p>
        
        <div className="h-[350px] border border-border-subtle p-6 bg-surface-container rounded-xl">
          {isLoadingTrend ? (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-50 animate-pulse">
              <span className="material-symbols-outlined text-[48px] mb-4 text-sage-green">monitoring</span>
              <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Gathering Matrix Data...</span>
            </div>
          ) : trendResponse?.data && trendResponse.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendResponse.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FFA3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#A1A1AA" 
                  fontSize={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    // Handle invalid dates just in case
                    if (isNaN(d.getTime())) return val;
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#A1A1AA" 
                  fontSize={10} 
                  allowDecimals={false} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    borderColor: '#27272A', 
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                  itemStyle={{ color: '#00FFA3' }}
                  labelStyle={{ color: '#A1A1AA', fontSize: '12px', marginBottom: '4px' }}
                  labelFormatter={(val) => {
                    const d = new Date(val);
                    if (isNaN(d.getTime())) return val;
                    return d.toLocaleDateString();
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00FFA3" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  activeDot={{ r: 6, fill: '#00FFA3', stroke: '#141414', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
              <span className="material-symbols-outlined text-[48px] mb-4 text-on-surface-variant">bar_chart</span>
              <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant">No trend data available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-surface border border-border-subtle p-6 flex flex-col justify-between h-32 rounded-xl hover:border-border-variant transition-colors group">
      <div className="flex justify-between items-start">
        <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant group-hover:text-charcoal-text transition-colors">
          {title}
        </span>
        <span className={`material-symbols-outlined text-[20px] ${color} opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</span>
      </div>
      <div className="font-headline-lg text-[32px] font-bold text-charcoal-text">
        {value}
      </div>
    </div>
  );
}
