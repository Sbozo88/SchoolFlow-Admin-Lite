import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <ShieldCheck size={20} />
            </span>
            <span className="text-lg font-black">SchoolFlow Admin LITE</span>
          </Link>
          <Link className="text-sm font-bold text-teal-700 hover:text-teal-800" href="/login">
            Admin login
          </Link>
        </div>
      </header>
      {children}
    </main>
  );
}
