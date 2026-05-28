"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: "dashboard" },
  ];

  const SidebarContent = (
    <>
      <div>
        <div className="p-8 border-b border-border-subtle">
          <Link href="/" className="font-headline-md text-[24px] font-bold tracking-tighter text-charcoal-text">
            Synapse
          </Link>
        </div>
        <nav className="p-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-label-mono text-[12px] uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-charcoal-text text-sand-bg"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-charcoal-text"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6 border-t border-border-subtle">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 font-label-mono text-[12px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Terminate Session
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-sand-bg text-charcoal-text selection:bg-electric-tangerine selection:text-white">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-border-subtle z-50 flex items-center justify-between px-6">
        <Link href="/" className="font-headline-md text-[20px] font-bold tracking-tighter text-charcoal-text">
          Synapse
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-charcoal-text">
          <span className="material-symbols-outlined text-[24px]">{isMobileMenuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 border-r border-border-subtle bg-surface-container-lowest flex-col justify-between sticky top-0 h-screen z-40">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="md:hidden w-64 border-r border-border-subtle bg-surface-container-lowest flex flex-col justify-between fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 shadow-2xl"
          >
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 top-16 bg-charcoal-text/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 p-6 pt-24 md:p-12 md:pt-12">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
