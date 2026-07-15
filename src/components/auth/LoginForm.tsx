"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import { DEMO_SCHOOL_DEFINITIONS, DEMO_SCHOOL_PASSWORD } from "@/lib/provision/bootstrapDemoPlatform";

function safeNextPath(value: string | null, fallback: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

export function LoginForm() {
  const {
    login,
    loginWithGoogle,
    resetPassword,
    user,
    loading,
    authError,
    isConfigured,
    homePath,
    workspace,
    tenantId,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedNext = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && workspace !== "none") {
      const destination = safeNextPath(requestedNext, homePath);
      // Platform users landing on /school without tenant are sent to super-admin unless next is super-admin
      if (workspace === "platform" && destination.startsWith("/school") && !destination.startsWith("/super-admin")) {
        navigate(homePath, { replace: true });
      } else {
        // Send users of demo tenants to the public demo workspace instead of the standard school workspace
        let finalDestination = destination;
        if (tenantId?.startsWith("tenant-demo-") && destination.startsWith("/school")) {
          finalDestination = destination.replace("/school", "/demo");
        }
        navigate(finalDestination, { replace: true });
      }
    }
  }, [homePath, loading, navigate, requestedNext, user, workspace, tenantId]);

  if (isSubmitting || loading) {
    return (
      <div className="w-full max-w-md">
        <BrandedLoading
          title={user ? "Opening admin workspace" : "Signing you in"}
          detail="Securing your SchoolFlow Admin session and preparing the dashboard."
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
      // Auth state effect will route via homePath/workspace once profile loads
    } catch {
      setError("We could not sign you in. Check the email, password, and admin profile.");
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
    } catch {
      setError("Google sign-in is not ready. Enable Google as a Firebase sign-in provider, then try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex h-full w-full max-w-sm flex-col justify-between" onSubmit={handleSubmit}>
      <div>
        {/* Logo pill */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 justify-center rounded-full border border-slate-200 bg-white px-5 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm">
            <img src="/images/logo.png" alt="SchoolFlow Logo" width={18} height={18} className="object-contain" />
            <span className="font-bold">SchoolFlow</span> Admin Lite
          </div>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500">Sign in to your admin dashboard</p>
        </div>

        {!isConfigured ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-800">
            Firebase credentials are not configured.
          </p>
        ) : null}

        {isConfigured ? (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-600">
            <p className="font-bold text-slate-800">Demo logins (after “Load demo platform”)</p>
            <p className="mt-1">
              <span className="font-semibold">Super Admin:</span> your Firebase account (promoted on load)
            </p>
            {DEMO_SCHOOL_DEFINITIONS.map((s) => (
              <p key={s.key} className="font-mono">
                {s.adminEmail} / {DEMO_SCHOOL_PASSWORD}
              </p>
            ))}
          </div>
        ) : null}

        {authError ? <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{authError}</p> : null}

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="h-[50px] w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
              placeholder="admin@school.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="current-password"
                className="h-[50px] w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
                placeholder="••••••••••••••••"
              />
              <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
        {notice ? <p className="mt-4 rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">{notice}</p> : null}

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <button
            className="h-[50px] w-full rounded-full bg-blue-600 text-[14px] font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isConfigured || isSubmitting}
            type="submit"
          >
            Submit
          </button>

          <div className="flex gap-3">
            <button
              className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              disabled={!isConfigured || isSubmitting}
              type="button"
            >
              <svg viewBox="0 0 384 512" className="size-4" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zm-110.9-176.2c16.3-21.5 28.5-51.4 25.4-81.5-26.6 1.1-57.6 17.8-74.6 39.1-14.7 18.2-28.8 48.9-24.9 78.4 29.3 2.3 57.8-14.5 74.1-36z"/></svg>
              Apple
            </button>
            <button
              className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              disabled={!isConfigured || isSubmitting}
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="size-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between text-[12px] font-medium text-slate-500">
        <button
          className="hover:text-slate-900 disabled:opacity-50 transition-colors"
          disabled={!isConfigured}
          onClick={handlePasswordReset}
          type="button"
        >
          Forgot password? <span className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-400">Reset</span>
        </button>
        <a href="#" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-400 transition-colors">Terms &amp; Conditions</a>
      </div>
    </form>
  );
}
