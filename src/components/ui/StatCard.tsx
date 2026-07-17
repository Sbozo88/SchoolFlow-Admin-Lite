import { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  /** Optional real trend; omit when no reliable comparison data. */
  trend?: "up" | "down" | "flat";
  change?: string;
  /** Support selection in analytics view */
  isSelected?: boolean;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  trend,
  change,
  isSelected,
  onClick,
}: StatCardProps) {
  const showTrend = Boolean(change && trend && trend !== "flat");
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`relative flex min-h-[138px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} p-5 shadow-[0_10px_28px_rgba(72,52,212,0.14)] transition-all duration-300 sm:p-6 ${
        isClickable
          ? "cursor-pointer select-none hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(72,52,212,0.22)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          : ""
      } ${
        isSelected
          ? "ring-4 ring-teal-400/90 shadow-[0_0_25px_rgba(45,212,191,0.4)] scale-[1.02]"
          : "border border-transparent"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon size={20} className="text-white" />
        </div>
        {showTrend ? (
          <div className="flex items-center gap-0.5 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold text-white">
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </div>
        ) : null}
      </div>
      <div>
        <p className="mb-1 text-[13px] font-medium text-white/75">{label}</p>
        <p className="text-[32px] font-bold leading-none tracking-tight text-white">{value}</p>
      </div>
      <div className="absolute -bottom-8 -right-8 size-28 rounded-full bg-white/[0.08]" />
    </div>
  );
}

