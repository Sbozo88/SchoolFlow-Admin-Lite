import { ArrowUpRight, ArrowDownRight, GraduationCap, Users2, UserCheck, DollarSign } from "lucide-react";

export function KpiCards() {
  const kpis = [
    { title: "Students", value: "1,260", change: "+12%", trend: "up" as const, gradient: "from-[#6c5ce7] to-[#4834d4]", icon: GraduationCap },
    { title: "Teachers", value: "224", change: "+3%", trend: "up" as const, gradient: "from-[#00d2d3] to-[#01a3a4]", icon: Users2 },
    { title: "Parents", value: "840", change: "+8%", trend: "up" as const, gradient: "from-[#ff6b81] to-[#ee5a24]", icon: UserCheck },
    { title: "Earnings", value: "$54,000", change: "+15%", trend: "up" as const, gradient: "from-[#feca57] to-[#f0932b]", icon: DollarSign },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div key={i} className={`rounded-[20px] bg-gradient-to-br ${kpi.gradient} p-5 flex flex-col justify-between h-[130px] shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group`}>
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-semibold text-white/80">{kpi.title}</h4>
              <div className="size-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[24px] font-bold text-white">{kpi.value}</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
                {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" />
          </div>
        );
      })}
    </div>
  );
}
