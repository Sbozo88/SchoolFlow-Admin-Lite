import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <select
        className={`h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-teal-900/50 ${className}`}
        id={id}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
