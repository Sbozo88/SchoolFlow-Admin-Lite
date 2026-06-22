import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600">
      <Loader2 className="animate-spin text-teal-700" size={18} />
      {label}
    </div>
  );
}
