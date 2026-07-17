import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { ArrowRight, CheckCircle2, LayoutDashboard, Settings } from "lucide-react";
import { DEMO_SCHOOL_DEFINITIONS, DEMO_SCHOOL_PASSWORD } from "@/lib/provision/bootstrapDemoPlatform";

export default function Home() {
  const { user, homePath, login, loginWithGoogle, isConfigured, tenantId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (tenantId?.startsWith("tenant-demo-")) {
        navigate("/demo", { replace: true });
      } else {
        navigate(homePath, { replace: true });
      }
    }
  }, [user, navigate, homePath, tenantId]);

  async function handleGoogleLogin() {
    setError("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("Google sign-in is not ready. Enable Google as a Firebase sign-in provider, then try again.");
      setIsSubmitting(false);
    }
  }

  async function handleDemoLogin(email: string) {
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, DEMO_SCHOOL_PASSWORD);
    } catch {
      setError("Demo account not found. Please sign in as Super Admin first and click 'Load demo platform'.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 -translate-y-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6c5ce7] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eee9ff] dark:bg-[#6c5ce7]/20 text-[#6c5ce7] dark:text-[#a29bfe] text-sm font-semibold mb-8">
            <span className="flex size-2 rounded-full bg-[#6c5ce7] animate-pulse"></span>
            SchoolFlow Admin Lite is now available
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
            Clean school admin <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe]">
              in 7 days.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Replace scattered spreadsheets and paper registers with one unified, easy-to-use platform designed specifically for growing schools.
          </p>

          {!isConfigured ? (
            <p className="mb-8 max-w-md mx-auto rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-800">
              Firebase credentials are not configured.
            </p>
          ) : null}
          {error ? (
            <p className="mb-8 max-w-md mx-auto rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium leading-6 text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
            {user ? (
              <Link
                to={homePath}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] px-8 py-4 font-bold text-white shadow-lg shadow-[#6c5ce7]/30 transition-transform hover:scale-105"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button
                  disabled={!isConfigured || isSubmitting}
                  onClick={handleGoogleLogin}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 text-[14px] font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Super Admin (Google)
                </button>
                <div className="flex flex-col gap-3">
                  {DEMO_SCHOOL_DEFINITIONS.map(s => (
                    <button
                      key={s.key}
                      disabled={!isConfigured || isSubmitting}
                      onClick={() => handleDemoLogin(s.adminEmail)}
                      className="flex w-full items-center justify-between gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-[#6c5ce7] dark:bg-[#a29bfe] px-6 py-4 text-[14px] font-bold text-white dark:text-slate-900 shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <span>{s.organizationName}</span>
                      <ArrowRight size={18} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Feature Snapshot */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2ed573] to-[#10ac84] flex items-center justify-center mb-6 text-white shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Attendance</h3>
              <p className="text-slate-600 dark:text-slate-400">Mark registers with a tap. Automatically generate weekly compliance reports.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] flex items-center justify-center mb-6 text-white shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Unified Dashboard</h3>
              <p className="text-slate-600 dark:text-slate-400">See your entire school at a glance: learners, payments, and outstanding tasks.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#feca57] to-[#f0932b] flex items-center justify-center mb-6 text-white shadow-sm">
                <Settings size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Done-for-You Setup</h3>
              <p className="text-slate-600 dark:text-slate-400">We import your data, configure your settings, and train your staff in just 7 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Snapshot */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Simple, predictable pricing.</h2>
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800">
              <h3 className="font-bold text-xl mb-2">Starter Setup</h3>
              <p className="text-slate-500 mb-6">Once-off setup fee</p>
              <div className="text-4xl font-extrabold mb-6">R2,500</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Includes data import, branding configuration, and 1-on-1 staff training.</p>
            </div>
            <div className="bg-[#6c5ce7]/5 dark:bg-[#6c5ce7]/10 rounded-3xl p-8 border border-[#6c5ce7]/20">
              <h3 className="font-bold text-xl mb-2 text-[#6c5ce7] dark:text-[#a29bfe]">Monthly Support</h3>
              <p className="text-slate-500 mb-6">Billed monthly</p>
              <div className="text-4xl font-extrabold mb-6">from R750<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Unlimited learners and staff, secure cloud backups, and priority support.</p>
            </div>
          </div>
          <div className="mt-12">
            <Link to="/pricing" className="font-bold text-[#6c5ce7] hover:text-[#4834d4] dark:text-[#a29bfe] dark:hover:text-white flex items-center justify-center gap-2">
              View full pricing details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to transform your school?</h2>
          <p className="text-xl text-slate-300 mb-10">Stop struggling with paperwork. Get your school running smoothly in 7 days.</p>
          <Link
            to="/enroll"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-slate-900 shadow-xl transition-transform hover:scale-105"
          >
            Request Your Setup
          </Link>
        </div>
      </section>
    </div>
  );
}

