"use client";

import { School, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

function safeNextPath(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/admin";
}

export function LoginForm() {
  const { login, loginWithGoogle, resetPassword, user, loading, authError, isConfigured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams?.get("next") ?? null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, nextPath, router, user]);

  if (isSubmitting || loading) {
    return (
      <div className="w-full max-w-md">
        <BrandedLoading
          title={user ? "Opening admin workspace" : "Signing you in"}
          detail="Securing your SchoolFlow session and preparing the dashboard."
        />
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace(nextPath);
    } catch {
      setError("We could not sign you in. Check the email, password, and admin profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setNotice("");
    if (!email) {
      setError("Enter your email first, then request a reset link.");
      return;
    }
    try {
      await resetPassword(email);
      setNotice("Password reset email sent. Check your inbox.");
    } catch {
      setError("We could not send a reset email for that address.");
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setNotice("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      router.replace(nextPath);
    } catch {
      setError("Google sign-in is not ready. Enable Google as a Firebase sign-in provider, then try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none" onSubmit={handleSubmit}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
          <School size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">SchoolFlow Admin LITE</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Secure access to your school management dashboard</p>
      </div>

      {!isConfigured ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-800">
          Firebase credentials are not configured. Add `.env.local` values to enable secure login.
        </p>
      ) : null}

      {authError ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{authError}</p> : null}

      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="mb-5 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-500 dark:focus:bg-slate-900 dark:focus:ring-teal-900/30"
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
        placeholder="admin@school.com"
      />

      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className="mb-6 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-500 dark:focus:bg-slate-900 dark:focus:ring-teal-900/30"
        id="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
        placeholder="••••••••"
      />

      {error ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
      {notice ? <p className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">{notice}</p> : null}

      <button
        className="mb-4 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-800"
        disabled={!isConfigured || isSubmitting}
        onClick={handleGoogleLogin}
        type="button"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-700 dark:text-slate-300">G</span>
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3 opacity-60">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button className="h-12 w-full rounded-xl text-sm" disabled={!isConfigured || isSubmitting} type="submit">
        <LockKeyhole size={18} className="mr-2" />
        Sign In to Workspace
      </Button>

      <button
        className="mt-4 w-full text-center text-sm font-bold text-teal-700 hover:text-teal-800 disabled:text-slate-400"
        disabled={!isConfigured}
        onClick={handlePasswordReset}
        type="button"
      >
        Reset password
      </button>
    </form>
  );
}
