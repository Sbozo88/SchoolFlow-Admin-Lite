import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <ShieldCheck size={20} />
            </span>
            <span className="text-lg font-black">SchoolFlow Admin Lite</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link className="text-sm font-bold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200" to="/login">
              Admin login
            </Link>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
