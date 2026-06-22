"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

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
    <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-slate-950 text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-950">SchoolFlow Admin LITE</h1>
          <p className="text-sm text-slate-500">Admin-only access</p>
        </div>
      </div>

      {!isConfigured ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-800">
          Firebase credentials are not configured. Add `.env.local` values to enable secure login.
        </p>
      ) : null}

      {authError ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{authError}</p> : null}

      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="mb-4 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
      />

      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className="mb-4 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        id="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />

      {error ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
      {notice ? <p className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">{notice}</p> : null}

      <button
        className="mb-3 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!isConfigured || isSubmitting}
        onClick={handleGoogleLogin}
        type="button"
      >
        <span className="flex size-5 items-center justify-center rounded-full border border-slate-200 text-xs font-black text-slate-700">G</span>
        Continue with Google
      </button>

      <div className="mb-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Button className="w-full" disabled={!isConfigured || isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
        Sign in
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
