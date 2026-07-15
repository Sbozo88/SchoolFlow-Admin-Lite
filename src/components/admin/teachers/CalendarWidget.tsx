import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarWidget() {
  const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  // Mock dates for Feb 2023 per spec
  const row1 = [null, null, null, null, null, 1, 2, 3]; // padding + start
  const row2 = [4, 5, 6, 7, 8, 9, 10];
  const row3 = [11, 12, 13, 14, 15, 16, 17];
  const row4 = [18, 19, 20, 21, 22, 23, 24];
  const row5 = [25, 26, 27, 28, null, null, null];

  return (
    <div className="rounded-[32px] bg-[#4B5373] p-8 text-white shadow-md h-full flex flex-col relative">
      <div className="absolute top-6 right-6 text-white/50 cursor-pointer hover:text-white">
        <MoreHorizontal size={20} />
      </div>
      
      <h3 className="text-xl font-bold mb-6">Event Calendar</h3>
      
      <div className="flex rounded-xl bg-white p-1 mb-8">
        <button className="flex-1 rounded-lg bg-[#F4A28C] py-2 text-[14px] font-bold text-white shadow-sm">
          Day to day
        </button>
        <button className="flex-1 rounded-lg py-2 text-[14px] font-bold text-[#1E293B]">
          Events
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-bold">Feb 2023</span>
        <div className="flex items-center gap-4 text-white/50">
          <ChevronLeft size={20} className="cursor-pointer hover:text-white" />
          <ChevronRight size={20} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-[13px]">
        {days.map((d) => (
          <div key={d} className="font-medium text-white/50 mb-2">{d}</div>
        ))}

        {/* Calendar Grid */}
        {row1.slice(1).map((d, i) => (
          <div key={`r1-${i}`} className="flex items-center justify-center p-1 text-white/90">
            {d}
          </div>
        ))}
        {row2.map((d, i) => (
          <div key={`r2-${i}`} className="flex items-center justify-center p-1 text-white/90">
            {d}
          </div>
        ))}
        {row3.map((d, i) => (
          <div key={`r3-${i}`} className="flex items-center justify-center p-1 text-white/90">
            {d === 16 ? (
              <span className="flex size-8 items-center justify-center rounded-full bg-[#F4A28C] text-white font-bold shadow-sm">
                {d}
              </span>
            ) : (
              d
            )}
          </div>
        ))}
        {row4.map((d, i) => (
          <div key={`r4-${i}`} className="flex items-center justify-center p-1 text-white/90">
            {d}
          </div>
        ))}
        {row5.map((d, i) => (
          <div key={`r5-${i}`} className="flex items-center justify-center p-1 text-white/90">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
