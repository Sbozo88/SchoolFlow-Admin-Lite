import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import { X } from "lucide-react";

export function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col md:flex-row font-sans overflow-hidden bg-slate-50">
      {/* Left Side: Form */}
      <div className="flex w-full flex-col justify-between px-8 py-8 md:w-[44%] md:px-12 md:py-12 lg:px-24 lg:py-16 relative z-10">
        <Suspense fallback={<BrandedLoading title="Loading secure login" detail="Preparing the admin sign-in form." />}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Side: Photo + Floating Widgets */}
      <div className="relative hidden w-full md:flex md:w-[56%]">
        <div className="relative h-full w-full overflow-hidden bg-slate-900">
            {/* Background Image */}
            <img
              src="/images/login-bg.png"
              alt="School Admin Team"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />

            {/* Subtle gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

            {/* Close Button (decorative) */}
            <button className="absolute right-5 top-5 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md shadow-lg hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>

            {/* Widget 1: Task Review (Blue card, top-left) */}
            <div className="absolute left-6 top-6 z-20 flex flex-col rounded-2xl bg-blue-600 px-5 py-4 shadow-xl min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-white">Task Review With Team</span>
                <div className="ml-3 size-2 rounded-full bg-white" />
              </div>
              <span className="mt-1 text-[11px] font-medium text-blue-100">09:30am - 10:00am</span>
            </div>
            {/* Secondary time label */}
            <div className="absolute left-[250px] top-[72px] z-20 rounded-lg bg-slate-900/80 px-3 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm border border-white/10">
              09:30am-10:00am
            </div>

            {/* Widget 2: Avatar bubbles (right side) */}
            <div className="absolute right-6 top-1/3 z-20 flex flex-col -space-y-1">
              <div className="size-14 rounded-full border-[3px] border-white bg-slate-300 shadow-lg overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-slate-400 to-slate-500" />
              </div>
              <div className="ml-6 size-12 rounded-full border-[3px] border-white bg-slate-300 shadow-lg overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-slate-400 to-slate-500" />
              </div>
            </div>

            {/* Widget 3: Calendar (white card, bottom-center) */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[320px] rounded-2xl bg-white/95 px-5 py-4 shadow-2xl backdrop-blur-sm border border-slate-200">
              <div className="flex justify-between text-center text-[12px] font-medium text-slate-500">
                {[
                  { day: "Sun", date: "22" },
                  { day: "Mon", date: "23" },
                  { day: "Tue", date: "24", active: true },
                  { day: "Wed", date: "25" },
                  { day: "Thu", date: "26" },
                  { day: "Fri", date: "27", highlight: true },
                  { day: "Sat", date: "28" },
                ].map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1">
                    <span className={d.active ? "font-bold text-slate-900" : ""}>{d.day}</span>
                    <span
                      className={`flex size-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                        d.active
                          ? "bg-blue-600 text-white"
                          : d.highlight
                          ? "bg-slate-900 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {d.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 4: Daily Meeting (white card, bottom-left) */}
            <div className="absolute bottom-4 left-6 z-20 w-[240px] rounded-2xl bg-white px-5 py-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900">Daily Meeting</span>
                  <span className="mt-0.5 text-[11px] text-slate-500">12:00pm-01:00pm</span>
                </div>
                <div className="size-2.5 rounded-full bg-blue-600" />
              </div>
              <div className="mt-3 flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-7 rounded-full border-2 border-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${
                        ["#3b82f6, #2563eb", "#64748b, #475569", "#0ea5e9, #0284c7", "#f43f5e, #e11d48"][i - 1]
                      })`,
                    }}
                  />
                ))}
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
