"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CircleAlert } from "lucide-react";
import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { DoctorSlotPicker } from "@/components/booking/doctor-slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CONSULT_PRICE, fmtSlot } from "@/lib/mock/doctors";
import {
  listDoctorsWithSlots,
  bookAppointment,
  type BookableDoctor,
} from "@/lib/db/client-api";
import { cn } from "@/lib/utils";

const STEPS = ["Reason", "Doctor & slot", "Review"];
type Phase = "reason" | "doctor" | "review";

const SYMPTOMS = [
  "Blurred vision",
  "Redness or irritation",
  "Pain",
  "Discharge / watering",
  "Itching",
  "Routine check / glasses",
  "Follow-up",
];

const BKEY = "clearsight.booking";
function readBooking(): Record<string, unknown> {
  try {
    return JSON.parse(sessionStorage.getItem(BKEY) || "{}");
  } catch {
    return {};
  }
}
function writeBooking(patch: Record<string, unknown>) {
  try {
    sessionStorage.setItem(BKEY, JSON.stringify({ ...readBooking(), ...patch }));
  } catch {
    /* ignore */
  }
}

export function BookingFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("reason");
  const [symptom, setSymptom] = useState("");
  const [note, setNote] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [slot, setSlot] = useState("");
  const [consent, setConsent] = useState(false);
  const [booking, setBooking] = useState(false);
  const [doctors, setDoctors] = useState<BookableDoctor[]>([]);

  useEffect(() => {
    const b = readBooking();
    if (typeof b.symptom === "string") setSymptom(b.symptom);
    if (typeof b.note === "string") setNote(b.note);
    listDoctorsWithSlots().then(setDoctors);
  }, []);

  const doctor = useMemo(
    () => doctors.find((d) => d.id === doctorId),
    [doctors, doctorId],
  );

  const stepIndex = { reason: 0, doctor: 1, review: 2 }[phase];

  const confirm = async () => {
    if (!doctor || !slot) return;
    setBooking(true);
    const res = await bookAppointment({
      doctorId: doctor.id,
      startsAt: slot,
      reason: symptom,
      symptom,
      note: note || undefined,
    });
    setBooking(false);
    if (!res.ok) {
      toast.error(res.error);
      if (res.error.includes("just taken")) setPhase("doctor");
      return;
    }
    writeBooking({ ref: res.ref, doctorName: doctor.name, slot });
    router.push(`/payment-successful?appt=${res.id}`);
  };

  if (phase === "doctor") {
    return (
      <FocusShell
        fill
        center={<StepProgress steps={STEPS} current={1} />}
        exitHref="/dashboard"
      >
        <DoctorSlotPicker
          doctors={doctors}
          doctorId={doctorId}
          slot={slot}
          onSelectDoctor={setDoctorId}
          onSelectSlot={setSlot}
          onBack={() => setPhase("reason")}
          onNext={() => setPhase("review")}
        />
      </FocusShell>
    );
  }

  return (
    <FocusShell
      center={<StepProgress steps={STEPS} current={stepIndex} />}
      exitHref="/dashboard"
    >
      {phase === "reason" && (
        <div
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h1 className="text-2xl">What brings you in?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the closest match. You can add detail below.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSymptom(s);
                  writeBooking({ symptom: s });
                }}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  symptom === s
                    ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                    : "border-border text-muted-foreground-strong hover:bg-surface-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <Label htmlFor="note">Anything else? (optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                writeBooking({ note: e.target.value });
              }}
              placeholder="e.g. worse in the morning, left eye"
            />
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-triage-review/50 bg-triage-review-bg p-3.5 text-xs text-triage-review-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-triage-review" />
            If this is a sudden loss of vision, severe pain, or an injury, seek
            in-person emergency care now — don&apos;t wait for a booking.
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            You&apos;ll do a 5-minute guided self-test right after payment — the
            doctor opens your consult with the summary ready.
          </p>

          <FlowNav
            onBack={() => router.push("/dashboard")}
            backLabel="Cancel"
            onNext={() => setPhase("doctor")}
            nextDisabled={!symptom}
          />
        </div>
      )}

      {phase === "review" && (
        <div>
          <h1 className="text-2xl">Review and confirm</h1>

          <dl
            className="mt-6 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Row label="Reason">
              {symptom}
              {note ? <span className="text-muted-foreground"> — {note}</span> : null}
            </Row>
            <Row label="Doctor">
              {doctor?.name}{" "}
              <span className="text-muted-foreground">· {doctor?.specialty}</span>
            </Row>
            <Row label="Time">
              <span className="font-mono tabular-nums">
                {slot ? fmtSlot(slot) : "—"}
              </span>
            </Row>
            <Row label="Price">
              <span className="font-mono tabular-nums">₹{CONSULT_PRICE}</span>{" "}
              <span className="text-muted-foreground">incl. taxes</span>
            </Row>
          </dl>

          <Label
            className={cn(
              "mt-6 flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-[15px] font-normal leading-relaxed transition-colors",
              "focus-within:border-ring",
              consent
                ? "border-primary bg-primary-subtle"
                : "border-border bg-surface-muted",
            )}
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(Boolean(v))}
              className="mt-0.5"
            />
            I consent to this teleconsultation and understand it does not replace
            an in-person examination where one is needed.
          </Label>

          <FlowNav
            onBack={() => setPhase("doctor")}
            onNext={confirm}
            nextDisabled={!consent || !slot || booking}
            nextLabel={booking ? "Confirming…" : "Continue to payment"}
          />
        </div>
      )}
    </FocusShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-[15px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

function FlowNav({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Continue",
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {backLabel}
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className="bg-cta text-cta-foreground hover:bg-cta-hover"
      >
        {nextLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
