import { Suspense } from "react";
import { FocusShell } from "@/components/layout/focus-shell";
import { PaymentSuccess } from "@/components/booking/payment-success";

export const metadata = { title: "Payment successful" };

export default function Page() {
  return (
    <FocusShell exitHref="/dashboard" exitLabel="Done" containerSize="prose">
      <Suspense fallback={null}>
        <PaymentSuccess />
      </Suspense>
    </FocusShell>
  );
}
