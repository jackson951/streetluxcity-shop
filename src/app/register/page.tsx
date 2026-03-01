"use client";

import { useAuth } from "@/contexts/auth-context";
import { getFirstValidationError, registerSchema } from "@/lib/validation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShoppingBasket, Mail, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";

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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // UI state
  const [view, setView] = useState<"form" | "otp" | "success">("form");
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [simulatedOtp, setSimulatedOtp] = useState<string>("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  
  // Registration error state
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Form field handlers
  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Validate and submit registration form
  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErrors({});
    setRegistrationError(null);

    const parsed = registerSchema.safeParse({
      fullName: form.fullName,
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    });

    if (!parsed.success) {
      const error = getFirstValidationError(parsed.error);
      setFormErrors({ email: error });
      return;
    }

    setSubmitLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔐 [DEV] OTP:", generatedOtp);
      setSimulatedOtp(generatedOtp);
      setRegistrationData(parsed.data);
      
      setView("otp");
      setCountdown(120);
      
    } catch (err) {
      setFormErrors({ email: "Failed to send verification code. Please try again." });
    } finally {
      setSubmitLoading(false);
    }
  }

  // ✅ FIXED: Handle OTP validation AND registration in correct order
  async function handleOtpComplete(enteredOtp: string) {
    if (enteredOtp.length !== 6) return;
    
    setOtpLoading(true);
    setOtpError(null);
    setRegistrationError(null);

    try {
      // Step 1: Verify OTP
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      if (enteredOtp !== simulatedOtp) {
        setOtpError("Invalid code. Please check and try again.");
        return;
      }

      // ✅ Step 2: ONLY proceed to registration AFTER OTP is verified
      if (!registrationData) {
        throw new Error("Registration data not found. Please start over.");
      }

      // Attempt backend registration
      await register(registrationData);
      
      // ✅ Step 3: ONLY show success AFTER registration succeeds
      setView("success");
      
      // Redirect after brief animation
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
      
    } catch (err) {
      // ❌ Registration failed - show error and let user retry
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setRegistrationError(message);
      setOtpError("Verification succeeded, but account creation failed. Please retry.");
      
      // Keep user on OTP view so they can retry or go back
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0 || otpLoading) return;
    
    setOtpLoading(true);
    setOtp("");
    setOtpError(null);
    setRegistrationError(null);
    
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
    if (registrationError) setRegistrationError(null);
  }, [otp]);

  function handleBack() {
    setView("form");
    setOtp("");
    setOtpError(null);
    setRegistrationError(null);
    setSimulatedOtp("");
    setRegistrationData(null);
  }

  // Retry registration after error (keeps OTP verified)
  async function handleRetryRegistration() {
    if (!registrationData) return;
    
    setOtpLoading(true);
    setRegistrationError(null);
    setOtpError(null);
    
    try {
      await register(registrationData);
      setView("success");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setRegistrationError(message);
      setOtpError("Still having trouble? Try going back and checking your details.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 transition-transform group-hover:scale-105">
            <ShoppingBasket className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            StreetLux<span className="text-rose-500">City</span>
          </span>
        </Link>
        
        {view === "form" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Join thousands of happy shoppers across South Africa.</p>
          </>
        )}
        
        {view === "otp" && (
          <>
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
              We've sent a 6-digit code to <span className="font-medium text-slate-700">{form.email}</span>
            </p>
          </>
        )}
        
        {view === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">You're all set! 🎉</h1>
            <p className="mt-2 text-sm text-slate-500">Redirecting you to your new account...</p>
          </>
        )}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm sm:shadow-md relative">
        
        {/* Registration Form View */}
        {view === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={formErrors.fullName}>
                <input
                  className={inputClass}
                  placeholder="Jane Doe"
                  required
                  value={form.fullName}
                  onChange={update("fullName")}
                  disabled={submitLoading}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" error={formErrors.email}>
                <input
                  className={inputClass}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  disabled={submitLoading}
                />
              </Field>
            </div>

            <Field label="Password" error={formErrors.password}>
              <div className="relative">
                <input
                  className={`${inputClass} pr-11`}
                  placeholder="At least 8 characters"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={update("password")}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number" hint="optional" error={formErrors.phone}>
                <input
                  className={inputClass}
                  placeholder="+27 82 123 4567"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  disabled={submitLoading}
                />
              </Field>
              <Field label="Delivery address" hint="optional" error={formErrors.address}>
                <input
                  className={inputClass}
                  placeholder="Cape Town, South Africa"
                  value={form.address}
                  onChange={update("address")}
                  disabled={submitLoading}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
            >
              {submitLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Preparing verification...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Verification View */}
        {view === "otp" && (
          <div className="space-y-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-rose-50 border border-rose-100 w-fit mx-auto">
              <ShieldCheck className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-700">Secure verification</span>
            </div>

            {/* Registration Error Alert */}
            {registrationError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Account creation failed</p>
                  <p className="text-red-700 mt-0.5">{registrationError}</p>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={handleOtpComplete}
              disabled={otpLoading || !!registrationError}
              error={otpError || undefined}
            />

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-3 pt-2">
              {registrationError ? (
                // Show retry options if registration failed
                <>
                  <button
                    type="button"
                    onClick={handleRetryRegistration}
                    disabled={otpLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Retrying...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Retry Account Creation</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={otpLoading}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                  >
                    ← Edit your details and try again
                  </button>
                </>
              ) : (
                // Normal flow: resend or go back
                <>
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
                </>
              )}
            </div>

            {/* Loading Overlay */}
            {otpLoading && !registrationError && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-rose-500 border-t-transparent" />
                  <span className="text-sm font-medium text-slate-700">
                    {registrationData ? "Creating your account..." : "Verifying code..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success View */}
        {view === "success" && (
          <div className="py-8 text-center">
            <div className="space-y-2">
              <p className="text-slate-600">Welcome, <span className="font-semibold text-slate-900">{form.fullName.split(" ")[0]}!</span></p>
              <p className="text-sm text-slate-400">Setting up your experience...</p>
            </div>
            <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full animate-pulse" style={{ width: "100%" }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Links */}
      {view !== "success" && (
        <>
          <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            {view === "form" ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Need help?{" "}
                <Link href="/support" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                  Contact support
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
          </p>
        </>
      )}

      {/* Dev Mode OTP Display */}
      {process.env.NODE_ENV === "development" && view === "otp" && simulatedOtp && !registrationError && (
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