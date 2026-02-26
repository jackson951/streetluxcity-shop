"use client";

import { useAuth } from "@/contexts/auth-context";
import { getFirstValidationError, registerSchema } from "@/lib/validation";
import { ArrowRight, Chrome, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      fullName: form.fullName,
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined
    });
    if (!parsed.success) {
      setError(getFirstValidationError(parsed.error));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(parsed.data);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Create account</h2>
          <p className="text-sm text-slate-600">Join StreetLuxCity in a few quick steps.</p>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => setError("Google sign-up endpoint not connected yet.")}
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or create with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-slate-600">Full name</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="Jane Doe"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-slate-600">Email</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          </div>

          <label className="space-y-1.5 text-sm">
            <span className="text-slate-600">Password</span>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 outline-none ring-brand-500 focus:ring"
                placeholder="At least 8 characters"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-slate-600">Phone (optional)</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="+27 82 123 4567"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-slate-600">Address (optional)</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="Cape Town, South Africa"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </p>
    </section>
  );
}
