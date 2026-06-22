import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30",
  secondary: "bg-white text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-100",
  ghost: "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
