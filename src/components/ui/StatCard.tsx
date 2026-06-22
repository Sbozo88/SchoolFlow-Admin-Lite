import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
          {detail ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p> : null}
        </div>
        {icon ? <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200">{icon}</div> : null}
      </div>
    </Card>
  );
}
