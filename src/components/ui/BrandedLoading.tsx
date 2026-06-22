import { SchoolFlowLogo } from "@/components/ui/SchoolFlowLogo";

export function BrandedLoading({
  title = "Loading SchoolFlow",
  detail = "Preparing your admin workspace.",
  fullScreen = false,
}: {
  title?: string;
  detail?: string;
  fullScreen?: boolean;
}) {
  return (
    <main
      className={`relative isolate grid overflow-hidden bg-slate-950 px-4 text-white ${
        fullScreen ? "min-h-screen place-items-center" : "min-h-40 place-items-center rounded-3xl"
      }`}
    >
      <div className="school-loading-grid absolute inset-0 opacity-70" />
      <div className="absolute -left-24 top-12 size-64 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute -right-20 bottom-8 size-72 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

      <section className="relative z-10 w-full max-w-sm text-center">
        <div className="mx-auto mb-5 grid size-24 place-items-center rounded-[1.75rem] bg-white/10 shadow-2xl ring-1 ring-white/15 backdrop-blur">
          <div className="school-logo-pulse rounded-2xl">
            <SchoolFlowLogo />
          </div>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-200">SchoolFlow Admin LITE</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-300">{detail}</p>
        <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="school-loading-bar h-full w-1/2 rounded-full bg-gradient-to-r from-teal-300 via-white to-orange-300" />
        </div>
      </section>
    </main>
  );
}
