import { MoreHorizontal, Eye, Megaphone } from "lucide-react";

export function NoticeBoard() {
  const notices = [
    {
      title: "Inter-school competition",
      desc: "(sports/singing/drawing/drama)",
      date: "10 Feb, 2023",
      views: "7k",
      active: true,
      color: "bg-[#6c5ce7]"
    },
    {
      title: "Disciplinary action if school",
      desc: "discipline is not followed",
      date: "6 Feb, 2023",
      views: "7k",
      active: false,
      color: "bg-[#ff6b81]"
    },
    {
      title: "School Annual function",
      desc: "celebration 2023-24",
      date: "2 Feb, 2023",
      views: "7k",
      active: false,
      color: "bg-[#00d2d3]"
    },
    {
      title: "Returning library books timely",
      desc: "(Usually pinned on notice...)",
      date: "31 Jan, 2023",
      views: "7k",
      active: false,
      color: "bg-[#feca57]"
    }
  ];

  return (
    <div className="rounded-[24px] bg-white p-6 md:p-8 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#ff6b81] to-[#ee5a24] flex items-center justify-center">
            <Megaphone size={16} className="text-white" />
          </div>
          Notice Board
        </h3>
        <MoreHorizontal size={20} className="text-slate-400 cursor-pointer hover:text-[#6c5ce7] transition-colors" />
      </div>
      <p className="text-[13px] font-medium text-slate-400 mb-6">Create a notice or find messages for you!</p>

      <div className="space-y-3">
        {notices.map((notice, i) => (
          <div key={i} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-[#f8f7ff] transition-colors">
            {/* Color accent bar */}
            <div className={`w-1 h-12 rounded-full ${notice.color} shrink-0`} />
            
            {/* Image Placeholder */}
            <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.pravatar.cc/150?u=notice${i}`} alt="Notice" className="w-full h-full object-cover" />
            </div>

            {/* Title & Desc */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-slate-800 truncate">{notice.title}</h4>
              <p className="text-[12px] text-slate-400 truncate">{notice.desc}</p>
            </div>

            {/* Date Tag */}
            <div className={`hidden sm:flex px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 ${
              notice.active ? 'bg-[#6c5ce7] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {notice.date}
            </div>

            {/* Views */}
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 shrink-0 w-12 justify-end">
              <Eye size={14} className="text-[#6c5ce7]" /> {notice.views}
            </div>

            {/* Actions */}
            <MoreHorizontal size={18} className="text-slate-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
