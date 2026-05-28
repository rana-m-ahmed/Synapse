"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

export default function Integration({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const supabase = createClient();
  const [copied, setCopied] = useState(false);

  const { data: scriptCode = "Loading snippet...", isLoading, error } = useQuery({
    queryKey: ["widgetScript", agentId],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // This endpoint doesn't require auth since it's a public snippet
      const res = await fetch(`${baseUrl}/api/v1/widget/script/${agentId}`);
      if (!res.ok) throw new Error("Failed to load script");
      return res.text();
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest border border-border-subtle p-8 md:p-12">
      <h2 className="font-label-mono text-[14px] font-bold uppercase tracking-widest text-charcoal-text mb-8">
        Deployment Architecture
      </h2>

      {error && (
        <div className="mb-8 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] shrink-0">flag</span>
          <span>{(error as Error).message}</span>
        </div>
      )}

      <div className="space-y-12 max-w-3xl">
        <div>
          <h3 className="font-headline-md text-[20px] font-bold text-charcoal-text mb-2">
            Native Script Injection
          </h3>
          <p className="font-body-md text-on-surface-variant mb-6">
            Injects the widget directly into the host DOM for visceral animations and seamless integration. Paste this snippet just before the closing <code>&lt;/body&gt;</code> tag of your website.
          </p>
          <div className="relative group">
            <pre className={`bg-charcoal-text text-sand-bg p-6 font-label-mono text-[12px] overflow-x-auto ${isLoading ? 'animate-pulse' : ''}`}>
              <code>{scriptCode}</code>
            </pre>
            <button 
              onClick={handleCopy}
              disabled={isLoading || !!error}
              className={`absolute top-4 right-4 text-sand-bg transition-opacity ${copied ? 'opacity-100 text-sage-green' : 'opacity-50 hover:opacity-100'} disabled:opacity-0`}
              title="Copy to Clipboard"
            >
              <span className="material-symbols-outlined">{copied ? "check" : "content_copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
