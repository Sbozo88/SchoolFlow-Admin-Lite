"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ["SU", "MO", "TU", "WE", "TR", "FR", "SA"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-[#2B3674] rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl px-4 py-2">
        <button onClick={prevMonth} className="text-slate-400 hover:text-slate-800 transition">
          <ChevronLeft size={18} strokeWidth={3} />
        </button>
        <span className="font-bold text-slate-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={nextMonth} className="text-slate-400 hover:text-slate-800 transition">
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-[#A3AED0] mb-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-3">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="text-center"></div>
        ))}
        {days.map(day => (
          <div key={day} className="flex justify-center items-center">
            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors cursor-pointer
              ${isToday(day) ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'text-white hover:bg-white/10'}`}
            >
              {day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
