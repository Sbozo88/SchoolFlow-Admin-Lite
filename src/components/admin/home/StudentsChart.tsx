"use client";

import { MoreHorizontal, Users } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Female', value: 45, fill: '#a29bfe' },
  { name: 'Male', value: 55, fill: '#6c5ce7' }
];

export function StudentsChart() {
  return (
    <div className="rounded-[24px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-6 right-6 text-slate-400 cursor-pointer hover:text-[#6c5ce7] transition-colors">
        <MoreHorizontal size={20} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <div className="size-8 rounded-lg bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] flex items-center justify-center">
          <Users size={16} className="text-white" />
        </div>
        Students
      </h3>

      <div className="flex-1 relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 z-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="100%" 
              barSize={10} 
              data={data}
              startAngle={180}
              endAngle={-180}
            >
              <RadialBar
                background={{ fill: '#f0f2f8' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Icon */}
        <div className="relative z-10 size-14 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#4834d4] flex items-center justify-center shadow-lg shadow-[#6c5ce7]/20">
          <Users size={22} className="text-white" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-[#6c5ce7]"></div>
          <div>
            <span className="text-[12px] font-medium text-slate-400">Male</span>
            <p className="text-lg font-bold text-slate-900">55%</p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-[#a29bfe]"></div>
          <div>
            <span className="text-[12px] font-medium text-slate-400">Female</span>
            <p className="text-lg font-bold text-slate-900">45%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
