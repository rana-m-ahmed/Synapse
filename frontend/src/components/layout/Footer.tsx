export function Footer() {
  return (
    <footer className="w-full py-8 bg-surface-container-lowest relative z-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-electric-tangerine flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
          </span>
          <span className="font-label-mono text-[12px] font-bold text-charcoal-text tracking-widest uppercase">
            Synapse Engine
          </span>
        </div>
        
        <nav className="flex items-center gap-6 md:gap-8">
          <a href="/login" className="text-on-surface-variant font-label-mono text-[11px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-200">
            Login
          </a>
          <a href="/register" className="text-on-surface-variant font-label-mono text-[11px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-200">
            Sign Up
          </a>
          <a href="/dashboard" className="text-on-surface-variant font-label-mono text-[11px] uppercase tracking-widest hover:text-electric-tangerine transition-colors duration-200">
            Dashboard
          </a>
        </nav>
        
        <span className="font-body-md text-[14px] text-on-surface-variant opacity-60">
          © 2026. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
