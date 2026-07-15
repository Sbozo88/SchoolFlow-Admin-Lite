export function SchoolFlowLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex size-14 items-center justify-center rounded-2xl bg-slate-950 p-2 shadow-lg shadow-slate-950/20 ring-1 ring-white/10 dark:bg-white ${className}`}
    >
      <img
        src="/images/logo.png"
        alt="SchoolFlow Logo"
        width={40}
        height={40}
        className="object-contain"
      />
    </div>
  );
}
