import { MoreHorizontal } from "lucide-react";

export function BioCard() {
  return (
    <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center relative h-full">
      <div className="absolute top-6 right-6 text-slate-400 cursor-pointer">
        <MoreHorizontal size={20} />
      </div>
      <h3 className="w-full text-left text-lg font-bold text-[#1E293B] mb-6">Bio</h3>
      
      <div className="relative mb-6">
        <div className="size-32 rounded-full p-1 border-[3px] border-[#4f5b7d] border-l-transparent border-t-transparent -rotate-45">
          <div className="size-full rounded-full overflow-hidden rotate-45 border-4 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/150?u=carla" alt="Carla Peter" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[#1E293B]">Carla Peter <span className="text-[#F4A28C] text-sm">(14)</span></h2>
        <p className="text-[14px] font-medium text-[#1E293B]">carlapeter@gmail.com</p>
        <p className="text-[14px] font-medium text-[#94A3B8]">+ 88 9856418</p>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button className="flex size-10 items-center justify-center rounded-full bg-white text-[#596080] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-100 hover:text-indigo-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white text-[#596080] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-100 hover:text-indigo-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white text-[#596080] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-100 hover:text-indigo-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white text-[#596080] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-100 hover:text-indigo-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white text-[#596080] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-100 hover:text-indigo-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </button>
      </div>
    </div>
  );
}
