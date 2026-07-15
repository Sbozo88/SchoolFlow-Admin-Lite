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
    <div className="rounded-[24px] p-6 text-white shadow-lg overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)' }}>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-lg">Event Calendar</h3>
        <button className="text-white/60 hover:text-white transition-colors">
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-current" />
            <span className="size-1.5 rounded-full bg-current" />
            <span className="size-1.5 rounded-full bg-current" />
          </div>
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm p-1 rounded-2xl flex mb-6 relative z-10">
        <button className="flex-1 bg-[#ff6b81] text-white py-2 rounded-xl text-[13px] font-bold shadow-sm">
          Day to day
        </button>
        <button className="flex-1 text-white/70 py-2 rounded-xl text-[13px] font-bold hover:text-white transition-colors">
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
