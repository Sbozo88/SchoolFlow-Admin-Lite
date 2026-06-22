import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl bg-white shadow-sm ${className}`} {...props} />;
}
