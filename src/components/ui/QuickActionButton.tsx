import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type QuickActionButtonProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  size?: "large" | "small";
};

export function QuickActionButton({ label, href, icon: Icon, gradient, shadow, size = "large" }: QuickActionButtonProps) {
  const isLarge = size === "large";
  
  return (
    <Link
      to={href}
      className="group flex items-center gap-3.5 rounded-[22px] border border-slate-100/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(108,92,231,0.12)]"
    >
      <div
        className={`flex ${isLarge ? 'size-12' : 'size-11'} shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} ${shadow} transition-transform group-hover:scale-105`}
      >
        <Icon size={isLarge ? 20 : 18} className="text-white" />
      </div>
      <span className="text-[14px] font-bold text-slate-800">{label}</span>
    </Link>
  );
}
