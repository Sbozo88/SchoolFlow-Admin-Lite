import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        className={`h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 ${className}`}
        id={id}
        {...props}
      />
    </label>
  );
}
