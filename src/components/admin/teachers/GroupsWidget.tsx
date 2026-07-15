import { ArrowUpRight } from "lucide-react";

export function GroupsWidget() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top 2 Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h4 className="text-[14px] font-medium text-[#94A3B8] mb-2">Events</h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-[#1E293B]">6</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#596080] text-white">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
        
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h4 className="text-[14px] font-medium text-[#94A3B8] mb-2">Target achieved</h4>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-[#1E293B]">84%</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-[#94A3B8]">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Block */}
      <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1">
        <h3 className="text-lg font-bold text-[#1E293B] mb-6">Groups</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Group 1 */}
          <div className="rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-between min-h-[120px] shadow-sm">
            <h4 className="text-[14px] font-bold text-[#1E293B]">Teacher&apos;s</h4>
            <p className="text-[12px] text-[#94A3B8] font-medium mb-3">Union</p>
            <button className="w-full rounded-xl bg-[#F4A28C] py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90">
              Join
            </button>
          </div>
          
          {/* Group 2 */}
          <div className="rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-between min-h-[120px] shadow-sm">
            <h4 className="text-[14px] font-bold text-[#1E293B]">5th class</h4>
            <p className="text-[12px] text-[#94A3B8] font-medium mb-3">Maths</p>
            <button className="w-full rounded-xl bg-[#F4A28C] py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90">
              Join
            </button>
          </div>
          
          {/* Group 3 */}
          <div className="rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-between min-h-[120px] shadow-sm">
            <h4 className="text-[14px] font-bold text-[#1E293B]">6th class</h4>
            <p className="text-[12px] text-[#94A3B8] font-medium mb-3">Science</p>
            <button className="w-full rounded-xl bg-[#F4A28C] py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90">
              Join
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex-1 rounded-xl bg-[#596080] py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90">
            + Create New Group
          </button>
          <div className="flex -space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?u=1" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?u=2" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?u=3" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
