import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle className="bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" />
      </div>
      <Suspense fallback={<div className="text-sm font-semibold text-slate-600">Loading secure login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

export default LoginPage;
