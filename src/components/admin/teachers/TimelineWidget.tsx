export function TimelineWidget() {
  const events = [
    { title: "Solve real-world prblems involving...", class: "5th", time: "10:00 am", active: true },
    { title: "Integers and rational numbers.", class: "8th", time: "11:00 am", active: false },
    { title: "Expressionas, equations and inequalities", class: "6th", time: "2:00 pm", active: false },
    { title: "Geometric transformations", class: "7th", time: "4:00 pm", active: false },
    { title: "Solve real-world prblems involving...", class: "5th", time: "", active: false },
  ];

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
      <h3 className="text-xl font-bold text-[#1E293B] mb-8">Today&apos;s Timeline</h3>
      
      <div className="relative pl-6 space-y-10 border-l-2 border-dashed border-slate-200 ml-3">
        {events.map((event, i) => (
          <div key={i} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute -left-[31px] top-1.5 size-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
              event.active ? 'border-[#F4A28C]' : 'border-slate-300'
            }`}>
              {event.active && <div className="size-1.5 rounded-full bg-[#F4A28C]" />}
            </div>
            
            {/* Content */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`text-[14px] font-bold ${event.active ? 'text-[#1E293B]' : 'text-[#94A3B8]'} mb-1`}>
                  {event.title}
                </h4>
                {event.class && (
                  <p className={`text-[13px] ${event.active ? 'text-[#F4A28C]' : 'text-[#F4A28C]/60'} font-medium`}>
                    Class: {event.class}
                  </p>
                )}
              </div>
              {event.time && (
                <span className="text-[13px] font-medium text-[#94A3B8] whitespace-nowrap ml-4">
                  {event.time}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
