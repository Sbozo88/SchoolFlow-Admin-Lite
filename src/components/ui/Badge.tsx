import type { HTMLAttributes } from "react";

type BadgeTone = "slate" | "teal" | "amber" | "rose" | "green";

const tones: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  green: "bg-emerald-50 text-emerald-700",
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
