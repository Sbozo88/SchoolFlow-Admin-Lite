"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#6c5ce7", "#ff6b81", "#feca57"];

export function AttendanceTrendChart({ data }: { data: { name: string; present: number; absent: number }[] }) {
  return (
    <div className="h-[260px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94A3B8", fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94A3B8", fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(108,92,231,0.15)' }}
          />
          <Line 
            type="monotone" 
            dataKey="present" 
            stroke="#1dd1a1" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="absent" 
            stroke="#ff6b81" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentStatusChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-[200px] w-full flex justify-center mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(108,92,231,0.15)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
        <span className="text-2xl font-black text-slate-800">
          {Math.round((data[0]?.value / (data.reduce((a,b)=>a+b.value,0)||1)) * 100)}%
        </span>
        <span className="text-[10px] text-[#6c5ce7] font-bold uppercase">{data[0]?.name}</span>
      </div>
    </div>
  );
}

export function ProgrammeDistributionChart({ data }: { data: { name: string; learners: number }[] }) {
  return (
    <div className="h-[220px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={100}
            tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip 
            cursor={{fill: 'rgba(108,92,231,0.04)'}}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(108,92,231,0.15)' }}
          />
          <Bar dataKey="learners" fill="#6c5ce7" radius={[0, 6, 6, 0]} barSize={20}>
            {
              data.map((entry, index) => {
                const colors = ["#6c5ce7", "#ff6b81", "#00d2d3", "#feca57", "#1dd1a1"];
                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
              })
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
