import { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  trend: "up" | "down";
  change: string;
};

export function StatCard({ label, value, icon: Icon, gradient, trend, change }: StatCardProps) {
  return (
    <div
      className={`relative flex min-h-[138px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} p-5 shadow-[0_10px_28px_rgba(72,52,212,0.14)] transition-transform duration-300 hover:scale-[1.02] sm:p-6`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold text-white">
          {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div>
        <p className="mb-1 text-[13px] font-medium text-white/75">{label}</p>
        <p className="text-[32px] font-bold leading-none tracking-tight text-white">{value}</p>
      </div>
      <div className="absolute -bottom-8 -right-8 size-28 rounded-full bg-white/[0.08]" />
    </div>
  );
}
