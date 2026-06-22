import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

export function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950 overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/50 via-slate-50 to-slate-50 dark:from-teal-900/20 dark:via-slate-950 dark:to-slate-950"></div>
      
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle className="bg-white/80 backdrop-blur-md shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-800" />
      </div>
      
      <div className="z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Suspense fallback={<BrandedLoading title="Loading secure login" detail="Preparing the admin sign-in form." />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

export default LoginPage;
