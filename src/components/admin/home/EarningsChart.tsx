"use client";

import { MoreHorizontal, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', Earnings: 46000, Expenses: 38000 },
  { name: 'Feb', Earnings: 28000, Expenses: 20000 },
  { name: 'Mar', Earnings: 36000, Expenses: 30000 },
  { name: 'Apr', Earnings: 50000, Expenses: 8000 },
  { name: 'May', Earnings: 30000, Expenses: 24000 },
  { name: 'Jun', Earnings: 12000, Expenses: 10000 },
  { name: 'Jul', Earnings: 18000, Expenses: 15000 },
  { name: 'Aug', Earnings: 32000, Expenses: 28000 },
  { name: 'Sep', Earnings: 43000, Expenses: 22000 },
  { name: 'Oct', Earnings: 12000, Expenses: 38000 },
  { name: 'Nov', Earnings: 20000, Expenses: 18000 },
  { name: 'Dec', Earnings: 26000, Expenses: 39000 },
];

export function EarningsChart() {
  return (
    <div className="rounded-[24px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#4834d4] flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            Earnings & Expenses
          </h3>
          <p className="text-[14px] text-slate-400 font-medium flex items-center gap-1 mt-1 cursor-pointer">
            2026 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MoreHorizontal size={20} className="text-slate-400 cursor-pointer hover:text-[#6c5ce7] transition-colors mb-2" />
          <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#6c5ce7]"></div> Earnings
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#ff6b81]"></div> Expenses
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
              tickFormatter={(value) => `${value / 1000}k`}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(108,92,231,0.04)' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(108,92,231,0.15)', background: 'white' }}
            />
            <Bar dataKey="Earnings" fill="#6c5ce7" radius={[6, 6, 6, 6]} barSize={10} />
            <Bar dataKey="Expenses" fill="#ff6b81" radius={[6, 6, 6, 6]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
