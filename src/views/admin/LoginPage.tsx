import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <Suspense fallback={<div className="text-sm font-semibold text-slate-600">Loading secure login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

export default LoginPage;
