import { GraduationCap } from "lucide-react";

export function SchoolFlowLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 dark:bg-white dark:text-slate-950 ${className}`}
    >
      <GraduationCap size={30} strokeWidth={2.4} />
    </div>
  );
}
