import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Book a consult" };

export default function Page() {
  return (
    <FocusShell
      center={<StepProgress steps={["Reason", "Doctor & slot", "Review", "Pay"]} current={0} />}
      exitHref="/dashboard"
    >
      <PagePlaceholder title="Booking flow" note="Reason → doctor/slot → review → Razorpay. Slot held during payment. Step 5." />
    </FocusShell>
  );
}
