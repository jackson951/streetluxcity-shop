"use client";

import { PaymentMethodForm } from "@/components/payment-method-form";
import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { CustomerProfile, PaymentMethod } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CreditCard, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ProfilePage() {
  const { token, refreshUser, effectiveCustomerId, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingMethod, setSavingMethod] = useState(false);
  const [workingMethodId, setWorkingMethodId] = useState<string | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !effectiveCustomerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [customer, paymentMethods] = await Promise.all([
        api.getCustomer(token, effectiveCustomerId),
        api.listPaymentMethods(token, effectiveCustomerId)
      ]);
      setProfile(customer);
      setMethods(paymentMethods);
      setFullName(customer.fullName);
      setEmail(customer.email);
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, effectiveCustomerId]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  return (
    <RequireAuth>
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h1 className="flex items-center gap-2 text-3xl font-semibold">
            <UserRound className="h-7 w-7 text-brand-600" />
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">Update your profile details and manage your saved payment methods.</p>
        </div>

        {!canUseCustomerFeatures ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            {hasAdminRole && viewMode === "ADMIN"
              ? "Switch to Customer View from the header to manage customer profile and payment methods."
              : "This account has no customer profile. Payment methods are available for customer accounts only."}
          </div>
        ) : null}

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading profile...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

        {effectiveCustomerId && profile ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Personal details</h2>
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!token) return;
                  setSavingProfile(true);
                  setMessage(null);
                  setError(null);
                  try {
                    const updated = await api.updateCustomer(token, effectiveCustomerId, {
                      fullName,
                      email,
                      phone: phone.trim() || undefined,
                      address: address.trim() || undefined
                    });
                    setProfile(updated);
                    setMessage("Profile updated.");
                    await refreshUser();
                  } catch (saveError) {
                    setError((saveError as Error).message);
                  } finally {
                    setSavingProfile(false);
                  }
                }}
              >
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">Full name</span>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">Address</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                    rows={3}
                  />
                </label>
                <button
                  disabled={savingProfile}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingProfile ? "Saving..." : "Save profile"}
                </button>
              </form>
            </article>

            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <CreditCard className="h-5 w-5 text-brand-600" />
                Payment methods
              </h2>

              <div className="space-y-3">
                {methods.length ? null : <p className="text-sm text-slate-600">No payment methods saved yet.</p>}
                {methods.map((method) => (
                  <div key={method.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {method.brand} **** {method.last4}
                        </p>
                        <p className="text-xs text-slate-500">
                          {method.cardHolderName} | exp {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                        </p>
                        <p className="text-xs text-slate-500">Added {formatDate(method.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {method.defaultMethod ? (
                          <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700">Default</span>
                        ) : (
                          <button
                            disabled={workingMethodId === method.id}
                            onClick={async () => {
                              if (!token) return;
                              setWorkingMethodId(method.id);
                              setError(null);
                              setMessage(null);
                              try {
                                await api.setDefaultPaymentMethod(token, effectiveCustomerId, method.id);
                                setMethods(await api.listPaymentMethods(token, effectiveCustomerId));
                                setMessage("Default payment method updated.");
                              } catch (actionError) {
                                setError((actionError as Error).message);
                              } finally {
                                setWorkingMethodId(null);
                              }
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          disabled={workingMethodId === method.id}
                          onClick={async () => {
                            if (!token) return;
                            setWorkingMethodId(method.id);
                            setError(null);
                            setMessage(null);
                            try {
                              await api.setPaymentMethodEnabled(token, effectiveCustomerId, method.id, !method.enabled);
                              setMethods(await api.listPaymentMethods(token, effectiveCustomerId));
                              setMessage(method.enabled ? "Payment method disabled." : "Payment method enabled.");
                            } catch (actionError) {
                              setError((actionError as Error).message);
                            } finally {
                              setWorkingMethodId(null);
                            }
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                        >
                          {method.enabled ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                    {!method.enabled ? (
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber-700">Disabled</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsAddingMethod((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isAddingMethod ? "Cancel" : "+ Add New Payment Method"}
              </button>

              {isAddingMethod ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <PaymentMethodForm
                    defaultBillingAddress={address}
                    submitting={savingMethod}
                    buttonLabel="Save payment method"
                    onSubmit={async (payload) => {
                      if (!token) return;
                      setSavingMethod(true);
                      setMessage(null);
                      setError(null);
                      try {
                        await api.createPaymentMethod(token, effectiveCustomerId, payload);
                        setMethods(await api.listPaymentMethods(token, effectiveCustomerId));
                        setMessage("Payment method saved.");
                        setIsAddingMethod(false);
                      } finally {
                        setSavingMethod(false);
                      }
                    }}
                  />
                </div>
              ) : null}
            </article>
          </div>
        ) : null}

        {/* <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Account access</p>
          <p className="mt-2">
            Self-disable is not yet exposed by backend API. Admins can disable user access from the admin users screen.
            {hasAdminRole ? " You can do this from Admin > Users." : ""}
          </p>
        </div> */}
      </section>
    </RequireAuth>
  );
}
