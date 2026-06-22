import type { HTMLAttributes } from "react";

type BadgeTone = "slate" | "teal" | "amber" | "rose" | "green";

const tones: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
};

export function Badge({
  className = "",
  tone = "slate",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-bold ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
