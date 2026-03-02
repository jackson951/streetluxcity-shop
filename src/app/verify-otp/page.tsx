"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { OtpType, OtpResponse } from "@/lib/types";
import { api } from "@/lib/api";

// Reusable Field component
function Field({
  label,
  hint,
  children,
  error,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700 flex items-center justify-between">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">({hint})</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 disabled:opacity-50 disabled:cursor-not-allowed";

// OTP Input Component with auto-advance and auto-submit
function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(0, 1);
    const newValue = value.split("");
    newValue[index] = digit;
    const joined = newValue.join("");
    onChange(joined);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (joined.length === 6 && joined.split("").every((d) => d !== "")) {
      onComplete(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((pasted) => {
        const digits = pasted.replace(/\D/g, "").slice(0, 6);
        onChange(digits);
        if (digits.length === 6) {
          onComplete(digits);
        }
        const lastFocused = Math.min(digits.length - 1, 5);
        inputsRef.current[lastFocused]?.focus();
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="\d{1}"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
              error
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 bg-slate-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:bg-white"
            } text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-500 font-medium animate-pulse">{error}</p>
      )}
    </div>
  );
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [simulatedOtp, setSimulatedOtp] = useState<string>("");
  
  // Flow state
  const [flow, setFlow] = useState<"registration" | "forgot-password" | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL params
  useEffect(() => {
    const flowParam = searchParams.get("flow");
    const emailParam = searchParams.get("email");
    
    if (flowParam === "registration" || flowParam === "forgot-password") {
      setFlow(flowParam);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // Generate OTP for demo
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔐 [DEV] OTP:", generatedOtp);
    setSimulatedOtp(generatedOtp);
    setCountdown(120);
  }, [searchParams]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    return null;
  }

  // Verify OTP
  async function handleOtpComplete(enteredOtp: string) {
    if (enteredOtp.length !== 6) return;
    
    setOtpLoading(true);
    setOtpError(null);
    setError(null);

    try {
      // Call real OTP verification endpoint
      await api.verifyOtp({ email, code: enteredOtp, type: flow === "forgot-password" ? "FORGOT_PASSWORD" : "REGISTRATION" });
      
      // For forgot password flow, show password reset form
      if (flow === "forgot-password") {
        setView("reset");
      } else {
        // For registration, show success
        setView("success");
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 2000);
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  }

  // Reset Password for forgot password flow
  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitLoading(true);
    
    try {
      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setView("success");
      
      // Redirect after brief animation
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password reset failed. Please try again.";
      setError(message);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0 || otpLoading) return;
    
    setOtpLoading(true);
    setOtp("");
    setOtpError(null);
    setError(null);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(newOtp);
      setCountdown(120);
      
    } catch (err) {
      setOtpError("Failed to resend code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Clear errors when OTP changes
  useEffect(() => {
    if (otpError) setOtpError(null);
  }, [otp]);

  function handleBack() {
    if (flow === "registration") {
      router.push("/register");
    } else if (flow === "forgot-password") {
      router.push("/forgot-password");
    } else {
      router.push("/");
    }
  }

  // View state for different flows
  const [view, setView] = useState<"otp" | "reset" | "success">("otp");

  if (flow === "forgot-password" && view === "reset") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 transition-transform group-hover:scale-105">
              <Mail className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              StreetLux<span className="text-rose-500">City</span>
            </span>
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors -ml-1 disabled:opacity-50"
              aria-label="Go back"
              disabled={submitLoading}
            >
              <ArrowLeft className="h-4 w-4 text-slate-500" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create new password</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">Choose a strong password for your account.</p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm sm:shadow-md relative">
          <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
            <Field label="New password" error={error}>
              <div className="relative">
                <input
                  className={`${inputClass} pr-11`}
                  placeholder="At least 8 characters"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={submitLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm new password" error={error}>
              <div className="relative">
                <input
                  className={`${inputClass} pr-11`}
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={submitLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={submitLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
            >
              {submitLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update password</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 transition-transform group-hover:scale-105">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              StreetLux<span className="text-rose-500">City</span>
            </span>
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {flow === "registration" ? "Account verified! 🎉" : "Password updated! 🎉"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {flow === "registration" ? "Redirecting you to sign in..." : "Redirecting you to sign in..."}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm sm:shadow-md">
          <div className="py-8 text-center">
            <div className="space-y-2">
              <p className="text-slate-600">
                {flow === "registration" 
                  ? "Your email has been verified successfully!" 
                  : "Your password has been updated successfully!"}
              </p>
              <p className="text-sm text-slate-400">Signing you in...</p>
            </div>
            <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full animate-pulse" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            StreetLux<span className="text-rose-500">City</span>
          </span>
        </Link>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors -ml-1 disabled:opacity-50"
            aria-label="Go back"
            disabled={otpLoading}
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Verify your email</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          We've sent a 6-digit code to <span className="font-medium text-slate-700">{email ?? "your email"}</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm sm:shadow-md relative">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-rose-50 border border-rose-100 w-fit mx-auto mb-4">
          <ShieldCheck className="h-4 w-4 text-rose-600" />
          <span className="text-xs font-medium text-rose-700">Secure verification</span>
        </div>

        {/* OTP Input */}
        <OtpInput
          value={otp}
          onChange={setOtp}
          onComplete={handleOtpComplete}
          disabled={otpLoading}
          error={otpError || undefined}
        />

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={countdown > 0 || otpLoading}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 ${countdown > 0 ? "animate-spin" : ""}`} />
            {countdown > 0 
              ? `Resend code in ${formatTime(countdown)}` 
              : "Didn't receive a code? Resend"}
          </button>
          
          <button
            type="button"
            onClick={handleBack}
            disabled={otpLoading}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            ← Use a different email
          </button>
        </div>

        {/* Loading Overlay */}
        {otpLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-rose-500 border-t-transparent" />
              <span className="text-sm font-medium text-slate-700">Verifying code...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        {flow === "registration" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
              Sign in
            </Link>
          </>
        )}
      </div>

      {/* Dev Mode OTP Display */}
      {process.env.NODE_ENV === "development" && simulatedOtp && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Dev Mode:</span> Your OTP is{" "}
            <span className="font-mono font-bold bg-amber-200 px-1.5 py-0.5 rounded">{simulatedOtp}</span>
          </p>
        </div>
      )}
    </div>
  );
}