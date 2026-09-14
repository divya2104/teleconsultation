"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ClipboardCheck, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAppointmentBrief,
  submitDraftTriage,
  type AppointmentBrief,
} from "@/lib/db/client-api";
import { clearDraft, hasFreeTest, readDraft } from "@/lib/intake-store";

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export function PaymentSuccess() {
  const params = useSearchParams();
  const appt = params.get("appt");
  const [b, setB] = useState<AppointmentBrief | null>(null);
  // "idle" = no free test to attach → the usual "start the self-test" card.
  const [attach, setAttach] = useState<"idle" | "working" | "done" | "failed">("idle");

  useEffect(() => {
    if (!appt) return;
    getAppointmentBrief(appt).then(setB);
    const d = readDraft();
    if (!hasFreeTest(d)) return;
    setAttach("working");
    submitDraftTriage(appt, d).then((res) => {
      if (res.ok) clearDraft();
      setAttach(res.ok ? "done" : "failed");
    });
  }, [appt]);

  const selfTestHref = appt
    ? `/intake/questionnaire?appt=${appt}`
    : "/intake/questionnaire";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="relative mx-auto flex h-[300px] w-full max-w-[400px] items-center justify-center overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center whitespace-nowrap font-heading text-7xl font-bold text-primary/5 sm:text-8xl"
        >
          Thank You!
        </span>
        <span className="absolute inset-0 grid place-items-center text-border">
          <ImageIcon className="size-12" />
        </span>
        {/* Drop the supplied illustration at public/media/payment-success.png */}
        <Image
          src="/media/payment-success.png"
          alt=""
          fill
          sizes="400px"
          className="relative object-contain mix-blend-multiply"
          priority
        />
      </div>

      <h1 className="mt-6 text-2xl sm:text-3xl">Your Payment is Successful</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you for your payment. An automated payment receipt will be sent to
        your registered email.
      </p>

      <div
        className="mt-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border-brand bg-surface-muted p-5 text-left sm:flex-row sm:items-center"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-primary-subtle text-primary">
          <ClipboardCheck className="size-5" />
        </span>
        <p className="flex-1 text-[15px] text-heading">
          {b?.startsAt
            ? `Your doctor sees you ${fmtDay(b.startsAt)}. `
            : "Your doctor will see you soon. "}
          {attach === "working"
            ? "Attaching your eye test results to this booking…"
            : attach === "done"
              ? "Your eye test results are attached — the doctor opens the consult with them ready."
              : attach === "failed"
                ? "We couldn't attach your eye test results. You can redo the 5-minute self-test now."
                : "Take the 5-minute self-test now so they start with the full picture."}
        </p>
        {attach === "working" ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
        ) : attach === "done" ? (
          <Button asChild className="shrink-0 bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href={`/booking-confirmed?appt=${appt}`}>
              Done
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="shrink-0 bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href={selfTestHref}>
              Start the self-test
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>

      <Link
        href="/dashboard"
        className="mt-5 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-heading"
      >
        Back to home
      </Link>
    </div>
  );
}
