import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl bg-white shadow-sm dark:bg-slate-800 dark:text-slate-100 ${className}`} {...props} />;
}
