import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, homePath } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3 group" to="/">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#4834d4] text-white shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/images/logo.png"
                alt="SchoolFlow Logo"
                width={18}
                height={18}
                className="object-contain brightness-0 invert"
                onError={(e) => {
                  // Fallback if logo.png doesn't exist in public
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
              SchoolFlow <span className="font-medium text-slate-500 dark:text-slate-400">Lite</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/features" className="text-slate-600 hover:text-[#6c5ce7] dark:text-slate-300 dark:hover:text-[#a29bfe] transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-slate-600 hover:text-[#6c5ce7] dark:text-slate-300 dark:hover:text-[#a29bfe] transition-colors">
              Pricing
            </Link>
            <Link to="/demo" className="text-slate-600 hover:text-[#6c5ce7] dark:text-slate-300 dark:hover:text-[#a29bfe] transition-colors">
              Live Demo
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link 
                className="text-sm font-bold bg-[#eee9ff] text-[#6c5ce7] hover:bg-[#e0d4ff] dark:bg-[#6c5ce7]/20 dark:text-[#a29bfe] dark:hover:bg-[#6c5ce7]/30 px-4 py-2 rounded-full transition-colors" 
                to={homePath}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                className="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-2 rounded-full transition-colors" 
                to="/"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#6c5ce7] text-white">
                  <span className="font-bold text-[10px]">SF</span>
                </div>
                <span className="font-bold text-sm">SchoolFlow Lite</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clean school admin in 7 days.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/features" className="hover:text-[#6c5ce7]">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-[#6c5ce7]">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-[#6c5ce7]">Interactive Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/enroll" className="hover:text-[#6c5ce7]">Contact Sales</Link></li>
                <li><Link to="/privacy" className="hover:text-[#6c5ce7]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#6c5ce7]">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} SchoolFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
