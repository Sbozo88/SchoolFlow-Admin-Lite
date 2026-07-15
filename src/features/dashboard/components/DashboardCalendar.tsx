import { ChevronLeft, ChevronRight } from "lucide-react";

export function DashboardCalendar() {
  const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const dates = [
    ['', '', '', '01', '02', '03', '04'],
    ['05', '06', '07', '08', '09', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '31', '']
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_12px_32px_rgba(72,52,212,0.22)]"
      style={{ background: "linear-gradient(160deg, #7c6cf0 0%, #5b4bdb 55%, #4834d4 100%)" }}
    >
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Event Calendar</h3>
        <button type="button" className="text-white/60 transition-colors hover:text-white" aria-label="Calendar menu">
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

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h4 className="font-bold text-[15px]">July 2026</h4>
        <div className="flex gap-3">
          <button className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <ChevronLeft size={18} />
          </button>
          <button className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-3 mb-2 relative z-10">
        {days.map(day => (
          <div key={day} className="text-center text-[11px] font-bold text-white/40">{day}</div>
        ))}
        
        {dates.flat().map((date, i) => (
          <div key={i} className="flex justify-center">
            {date === '02' ? (
              <div className="size-8 rounded-full bg-[#ff6b81] text-white flex items-center justify-center text-[13px] font-bold shadow-sm shadow-[#ff6b81]/30">
                {date}
              </div>
            ) : date === '15' ? (
              <div className="size-8 rounded-full bg-[#feca57] text-[#4834d4] flex items-center justify-center text-[13px] font-bold shadow-sm">
                {date}
              </div>
            ) : (
              <div className={`size-8 flex items-center justify-center text-[13px] font-medium ${date ? 'text-white/90 hover:bg-white/10 rounded-full cursor-pointer transition-colors' : ''}`}>
                {date}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-white/5" />
      <div className="absolute -top-6 -left-6 size-20 rounded-full bg-[#ff6b81]/10" />
    </div>
  );
}
