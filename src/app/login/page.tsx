"use client";

import { useAuth } from "@/contexts/auth-context";
import { getFirstValidationError, loginSchema } from "@/lib/validation";
import { ArrowRight, Eye, EyeOff, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TermsModal } from "@/components/terms-modal";
import { AxiosError } from "axios";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

// Official Google "G" logo in SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      setError(getFirstValidationError(parsed.error));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.push("/");
    } catch (err) {
      const axiosError = err as AxiosError;
setError(axiosError.response?.data 
  ? (axiosError.response.data as { message?: string }).message ?? axiosError.message
  : axiosError.message);
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">

      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
            <ShoppingBasket className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            StreetLux<span className="text-rose-500">City</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue shopping.</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

        {/* Google button */}
        <button
          type="button"
          onClick={() => setError("Google sign-in is coming soon — use email for now.")}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or sign in with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Email address</span>
            <input
              className={inputClass}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Password</span>
              <Link href="/forgot-password" className="text-xs text-rose-500 hover:text-rose-600 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                className={inputClass + " pr-11"}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing you in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
            Join for free
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        By signing in you agree to our{" "}
        <button 
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="underline hover:text-slate-600 cursor-pointer"
        >
          Terms
        </button>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
      </p>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setShowTermsModal(false)}
        title="Terms and Conditions"
        description="Please read and accept our terms and conditions."
        buttonText="I Accept"
      />
    </div>
  );
}
