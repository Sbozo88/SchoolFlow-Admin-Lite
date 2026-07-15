import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarEvent = {
  id: string;
  name: string;
  date: Date;
  time: string;
  color: string;
  textColor?: string;
};

interface DashboardCalendarProps {
  events: CalendarEvent[];
}

export function DashboardCalendar({ events }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  const generateGrid = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      grid.push(currentWeek);
    }
    return grid;
  };

  const grid = generateGrid();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getEventForDay = (day: number) => {
    return events.find((e) => {
      return (
        e.date.getFullYear() === year &&
        e.date.getMonth() === month &&
        e.date.getDate() === day
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_12px_32px_rgba(72,52,212,0.22)]"
      style={{ background: "linear-gradient(160deg, #7c6cf0 0%, #5b4bdb 55%, #4834d4 100%)" }}
    >
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Event Calendar</h3>
        <button
          type="button"
          className="text-white/60 transition-colors hover:text-white"
          aria-label="Calendar menu"
        >
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-current" />
            <span className="size-1.5 rounded-full bg-current" />
            <span className="size-1.5 rounded-full bg-current" />
          </div>
        </button>
      </div>

      <div className="relative z-10 mb-6 flex rounded-2xl bg-white/12 p-1 backdrop-blur-sm">
        <button
          type="button"
          className="flex-1 rounded-xl bg-[#ff6b81] py-2.5 text-[13px] font-bold text-white shadow-sm shadow-[#ff6b81]/30"
        >
          Day to day
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white/70 transition-colors hover:text-white"
        >
          Full Month
        </button>
      </div>

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <h4 className="text-[15px] font-bold">
          {monthName} {year}
        </h4>
        <div className="flex gap-3">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-2 grid grid-cols-7 gap-y-3">
        {days.map((day) => (
          <div key={day} className="text-center text-[11px] font-bold text-white/40">
            {day}
          </div>
        ))}

        {grid.flat().map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="flex justify-center size-8" />;
          }

          const event = getEventForDay(day);
          const isCurrentDay = isToday(day);
          const displayDay = day.toString().padStart(2, "0");

          if (event) {
            return (
              <div key={day} className="flex justify-center">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-[13px] font-bold shadow-sm ${event.color} ${
                    event.textColor ? event.textColor : "text-white"
                  }`}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                >
                  {displayDay}
                </div>
              </div>
            );
          }

          if (isCurrentDay) {
            return (
              <div key={day} className="flex justify-center">
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-white/40 text-[13px] font-bold text-white">
                  {displayDay}
                </div>
              </div>
            );
          }

          return (
            <div key={day} className="flex justify-center">
              <div className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[13px] font-medium text-white/90 transition-colors hover:bg-white/10">
                {displayDay}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-white/5" />
      <div className="absolute -left-6 -top-6 size-20 rounded-full bg-[#ff6b81]/10" />
    </div>
  );
}
