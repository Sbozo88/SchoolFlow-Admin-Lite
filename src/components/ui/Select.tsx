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
    <label className="grid gap-2 text-sm font-bold text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <select
        className={`h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 ${className}`}
        id={id}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
