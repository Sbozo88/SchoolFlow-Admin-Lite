export function CommunityBanner() {
  return (
    <div className="rounded-[24px] p-8 shadow-lg h-full relative overflow-hidden flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #ff6b81 0%, #ee5a24 100%)' }}>
      <div className="relative z-10 max-w-[200px]">
        <h3 className="text-[22px] font-bold text-white leading-tight mb-4">
          Join the community and find out more
        </h3>
        <p className="text-[13px] font-medium text-white/80 mb-6 leading-relaxed">
          Join different community and keep updated with the live notices and messages.
        </p>
        <button className="rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[#ee5a24] transition-all hover:shadow-lg hover:scale-[1.02]">
          Explore now
        </button>
      </div>

      {/* Decorative illustration area (bottom right) */}
      <div className="absolute -bottom-4 -right-4 w-[280px] h-[200px] opacity-90">
        <div className="w-full h-full bg-white/5 rounded-tl-full flex items-end justify-end p-4">
           <div className="flex -space-x-2 absolute bottom-8 left-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white/30 object-cover" src="https://i.pravatar.cc/150?u=c1" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white/30 object-cover" src="https://i.pravatar.cc/150?u=c2" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="size-8 rounded-full border-2 border-white/30 object-cover" src="https://i.pravatar.cc/150?u=c3" alt="" />
            <div className="flex size-8 items-center justify-center rounded-full bg-[#6c5ce7] border-2 border-white/30 text-[10px] font-bold text-white">+3k</div>
          </div>
        </div>
      </div>
      
      {/* Extra decorative elements */}
      <div className="absolute -top-6 -left-6 size-24 rounded-full bg-[#feca57]/15" />
      <div className="absolute top-1/2 -right-8 size-16 rounded-full bg-white/10" />
    </div>
  );
}
