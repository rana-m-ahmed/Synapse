export function Footer() {
  return (
    <footer className="w-full pt-stack-xl pb-stack-md border-t border-border-subtle bg-sand-bg relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-page max-w-screen-2xl mx-auto">
        <div className="md:col-span-6 flex flex-col justify-between">
          <span className="font-label-mono text-[12px] font-bold text-charcoal-text mb-8">
            Synapse
          </span>
          <p className="font-body-md text-[16px] text-on-surface-variant max-w-sm mb-8 md:mb-0">
            General Intelligent SaaS Chatbot.
          </p>
        </div>
        <div className="md:col-span-6 flex flex-col md:items-end justify-between">
          <nav className="flex flex-wrap gap-6 md:gap-8 mb-8 md:mb-0">
            <a href="/login" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
              Login
            </a>
            <a href="/register" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
              Sign Up
            </a>
            <a href="/dashboard" className="text-on-surface-variant font-label-mono text-[12px] hover:text-muted-terracotta transition-colors duration-200 opacity-80 hover:opacity-100">
              Dashboard
            </a>
          </nav>
          <span className="font-body-md text-[16px] text-on-surface-variant opacity-60">
            © 2026 Synapse Engine.
          </span>
        </div>
      </div>
    </footer>
  );
}
