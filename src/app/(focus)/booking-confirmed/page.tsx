import { Suspense } from "react";
import { FocusShell } from "@/components/layout/focus-shell";
import { BookingConfirmed } from "@/components/booking/booking-confirmed";

export const metadata = { title: "Booking confirmed" };

export default function Page() {
  return (
    <FocusShell exitHref="/dashboard" exitLabel="Done" containerSize="content">
      <Suspense fallback={null}>
        <BookingConfirmed />
      </Suspense>
    </FocusShell>
  );
}
