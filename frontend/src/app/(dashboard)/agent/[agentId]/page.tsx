"use client";

import { useEffect, useState, use } from "react";
import { fetchApi } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AgentUpdate {
  name: string;
  description: string;
  welcome_message: string;
  fallback_message: string;
  accent_color: string;
  is_active: boolean;
}

export default function AgentSettings({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AgentUpdate>({
    name: "",
    description: "",
    welcome_message: "",
    fallback_message: "",
    accent_color: "#4F46E5",
    is_active: true,
  });
  const [successToast, setSuccessToast] = useState(false);

  const { data: agent, isLoading, error: queryError } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const res = await fetchApi(`/api/v1/agents/${agentId}`, {}, session.access_token);
      return res;
    },
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        description: agent.description || "",
        welcome_message: agent.welcome_message || "",
        fallback_message: agent.fallback_message || "",
        accent_color: agent.accent_color || "#4F46E5",
        is_active: agent.is_active ?? true,
      });
    }
  }, [agent]);

  const updateMutation = useMutation({
    mutationFn: async (data: AgentUpdate) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/agents/${agentId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }, session.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/agents/${agentId}`, { method: "DELETE" }, session.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only include non-empty string fields; always include is_active and accent_color
    const payload: Record<string, any> = {
      name: formData.name,
      welcome_message: formData.welcome_message,
      fallback_message: formData.fallback_message,
      accent_color: formData.accent_color,
      is_active: formData.is_active,
    };
    if (formData.description.trim()) {
      payload.description = formData.description;
    }
    updateMutation.mutate(payload as AgentUpdate);
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this agent? This action is irreversible.")) return;
    deleteMutation.mutate();
  };

  if (isLoading) return <div className="animate-pulse font-label-mono text-[12px] text-on-surface-variant">Loading configuration...</div>;

  return (
    <div className="bg-surface-container-lowest border border-border-subtle p-8 md:p-12 relative overflow-hidden">
      <h2 className="font-label-mono text-[14px] font-bold uppercase tracking-widest text-charcoal-text mb-8">
        Core Parameters
      </h2>

      {/* Success Toast */}
      {successToast && (
        <div className="absolute top-8 right-8 p-4 bg-sage-green text-sand-bg font-body-md shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-right-8 duration-300 z-50">
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-sand-bg/80 mb-1">Configuration Synced</span>
            <span>Agent parameters updated successfully.</span>
          </div>
        </div>
      )}

      {(queryError || updateMutation.error || deleteMutation.error) && (
        <div className="mb-8 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none"></div>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">flag</span>
          <div className="flex flex-col">
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-sand-bg/80 mb-1">Attention Required</span>
            <span>
              {(queryError as Error)?.message || (updateMutation.error as Error)?.message || (deleteMutation.error as Error)?.message || "An error occurred."}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between p-4 border border-border-subtle bg-sand-bg">
          <div>
            <label className="font-headline-md font-bold text-charcoal-text block">Agent Status</label>
            <span className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
              {formData.is_active ? "Active & Accepting Queries" : "Suspended / Offline"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-green"></div>
          </label>
        </div>

        <div>
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            Agent Designation (Name)
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
          />
        </div>

        <div>
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            System Description (Internal Context)
          </label>
          <textarea 
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors resize-none"
          />
        </div>

        <div>
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            Welcome Message (Widget Greeting)
          </label>
          <textarea 
            rows={2}
            required
            value={formData.welcome_message}
            onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors resize-none"
          />
        </div>

        <div>
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            Fallback Message (No Context Found)
          </label>
          <textarea 
            rows={2}
            required
            value={formData.fallback_message}
            onChange={(e) => setFormData({ ...formData, fallback_message: e.target.value })}
            className="w-full bg-sand-bg border border-border-subtle p-4 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors resize-none"
          />
        </div>

        <div>
          <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            Widget Accent Color
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              value={formData.accent_color}
              onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
              className="w-16 h-16 cursor-pointer border-none p-0 bg-transparent"
            />
            <span className="font-label-mono text-[12px] uppercase text-on-surface-variant">
              {formData.accent_color}
            </span>
          </div>
        </div>

        <div className="pt-6">
          <MagneticButton 
            type="submit"
            className="bg-charcoal-text text-sand-bg font-label-mono text-[12px] uppercase tracking-widest px-8 py-4 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Syncing..." : "Save Configuration"}
          </MagneticButton>
        </div>
      </form>

      <div className="pt-8 border-t border-border-subtle mt-12 max-w-2xl">
        <h3 className="font-label-mono text-[12px] text-error font-bold uppercase tracking-widest mb-4">Danger Zone</h3>
        <p className="font-body-md text-[14px] text-on-surface-variant mb-6">
          Irreversibly delete this agent, including all ingested knowledge vectors, conversation logs, and widget configurations.
        </p>
        <button 
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="bg-error/10 text-error font-label-mono text-[10px] uppercase tracking-widest px-6 py-3 border border-error/20 hover:bg-error hover:text-white transition-colors disabled:opacity-50"
        >
          {deleteMutation.isPending ? "Deleting..." : "Terminate Agent"}
        </button>
      </div>
    </div>
  );
}
