"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtSlot } from "@/lib/mock/doctors";
import {
  getAppointmentBrief,
  type AppointmentBrief,
} from "@/lib/db/client-api";

export function BookingConfirmed() {
  const params = useSearchParams();
  const appt = params.get("appt");
  const [b, setB] = useState<AppointmentBrief | null>(null);

  useEffect(() => {
    if (appt) getAppointmentBrief(appt).then(setB);
  }, [appt]);

  return (
    <div className="mx-auto max-w-md text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-triage-normal-bg text-triage-normal-fg">
        <Check className="size-6" strokeWidth={2.5} />
      </span>
      <h1 className="mt-4 text-2xl">You&apos;re all set</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Booking{" "}
        {b?.ref ? (
          <span className="font-mono text-foreground">{b.ref}</span>
        ) : (
          "confirmed"
        )}{" "}
        and your self-test is done. Your doctor opens the consult with the triage
        summary ready.
      </p>

      {b ? (
        <dl className="mx-auto mt-6 max-w-sm divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface text-left">
          <Row label="Doctor">{b.doctorName}</Row>
          <Row label="Time">
            <span className="font-mono tabular-nums">
              {fmtSlot(b.startsAt)}
            </span>
          </Row>
        </dl>
      ) : null}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" />
        Details are on your WhatsApp. The e-prescription arrives there after the
        consult.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
          <Link href="/dashboard">Add to calendar</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}
