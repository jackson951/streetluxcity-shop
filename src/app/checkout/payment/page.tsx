import { Suspense } from "react";
import { CheckoutPaymentClient } from "./payment-page-client";

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading payment screen...</div>}>
      <CheckoutPaymentClient />
    </Suspense>
  );
}
