import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function NotFoundPage() {
  const { user } = useAuth();
  
  // Decide the best place to return based on whether they are logged in
  const returnPath = user ? "/school" : "/";
  const returnLabel = user ? "Return to Dashboard" : "Return Home";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-[#0f0f11] dark:text-white">
      <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#1c1c1f]">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-[#806df4]/10 dark:text-[#a99cff]">
          <Compass size={32} />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          404
        </h1>
        <p className="mt-2 text-base font-bold text-slate-700 dark:text-white/80">
          Page not found
        </p>
        <p className="mt-3 text-sm text-slate-500 dark:text-white/40">
          The page you are looking for doesn't exist, has been moved, or you might not have access to it.
        </p>
        
        <Link
          to={returnPath}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <ArrowLeft size={16} /> {returnLabel}
        </Link>
      </div>
    </div>
  );
}
