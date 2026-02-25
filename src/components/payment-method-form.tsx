"use client";

import { useState } from "react";

type PaymentMethodFormProps = {
  defaultBillingAddress?: string;
  submitting: boolean;
  buttonLabel?: string;
  onSubmit: (payload: {
    cardHolderName: string;
    cardNumber: string;
    brand?: string;
    expiryMonth: number;
    expiryYear: number;
    billingAddress?: string;
    defaultMethod?: boolean;
  }) => Promise<void>;
};

const CURRENT_YEAR = new Date().getFullYear();

export function PaymentMethodForm({ defaultBillingAddress, submitting, buttonLabel = "Save card", onSubmit }: PaymentMethodFormProps) {
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [expiryMonth, setExpiryMonth] = useState<number>(12);
  const [expiryYear, setExpiryYear] = useState<number>(CURRENT_YEAR + 1);
  const [billingAddress, setBillingAddress] = useState(defaultBillingAddress || "");
  const [defaultMethod, setDefaultMethod] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        try {
          await onSubmit({
            cardHolderName,
            cardNumber,
            brand: brand.trim() || undefined,
            expiryMonth,
            expiryYear,
            billingAddress: billingAddress.trim() || undefined,
            defaultMethod
          });
          setCardNumber("");
        } catch (submitError) {
          setError((submitError as Error).message);
        }
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Card holder</span>
          <input
            required
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            placeholder="Demo Customer"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Card number</span>
          <input
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            placeholder="4111 1111 1111 1111"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Brand (optional)</span>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            placeholder="VISA"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Billing address</span>
          <input
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            placeholder="123 Main St"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Expiry month</span>
          <input
            type="number"
            min={1}
            max={12}
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Expiry year</span>
          <input
            type="number"
            min={CURRENT_YEAR}
            max={2100}
            value={expiryYear}
            onChange={(e) => setExpiryYear(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={defaultMethod}
          onChange={(e) => setDefaultMethod(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Set as default method
      </label>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button
        disabled={submitting}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? "Saving..." : buttonLabel}
      </button>
    </form>
  );
}
