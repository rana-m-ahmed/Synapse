"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

export default function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agentId: string }>;
}) {
  const pathname = usePathname();
  const { agentId } = use(params);

  const tabs = [
    { name: "Configuration", href: `/agent/${agentId}` },
    { name: "Knowledge Base", href: `/agent/${agentId}/knowledge` },
    { name: "Playground", href: `/agent/${agentId}/playground` },
    { name: "Analytics", href: `/agent/${agentId}/analytics` },
    { name: "Integration", href: `/agent/${agentId}/integration` },
  ];

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-on-surface-variant hover:text-charcoal-text font-label-mono text-[10px] uppercase tracking-widest transition-colors mb-6">
          <span className="material-symbols-outlined text-[14px] mr-2">arrow_back</span>
          Return to Control Center
        </Link>
        <h1 className="font-headline-lg text-[32px] font-bold text-charcoal-text mb-6">
          Agent Inspector
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle overflow-x-auto scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`px-4 md:px-6 py-3 font-label-mono text-[11px] md:text-[12px] uppercase tracking-widest transition-colors relative whitespace-nowrap shrink-0 ${
                  isActive ? "text-charcoal-text font-bold" : "text-on-surface-variant hover:text-charcoal-text"
                }`}
              >
                {tab.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-electric-tangerine"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
