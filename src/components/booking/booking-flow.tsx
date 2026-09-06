"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  Languages,
  Stethoscope,
} from "lucide-react";
import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TriageBadge } from "@/components/common/triage-badge";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import {
  doctors,
  CONSULT_PRICE,
  fmtSlot,
  groupSlotsByDay,
  type Doctor,
} from "@/lib/mock/doctors";
import { readDraft } from "@/lib/intake-store";
import { scoreUrgency } from "@/lib/mock/intake";
import { cn } from "@/lib/utils";

const STEPS = ["Reason", "Doctor & slot", "Review", "Pay"];
type Phase = "reason" | "doctor" | "review" | "pay" | "done";
const HOLD_SECONDS = 300;

const SYMPTOMS = [
  "Blurred vision",
  "Redness or irritation",
  "Pain",
  "Discharge / watering",
  "Itching",
  "Routine check / glasses",
  "Follow-up",
];

const TRIAGE_STATE = ["normal", "review", "review", "urgent"] as const;

const BKEY = "clearsight.booking";
function readBooking(): { symptom?: string; note?: string } {
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
  const [pay, setPay] = useState<"idle" | "processing" | "failed" | "expired">("idle");
  const [left, setLeft] = useState(HOLD_SECONDS);

  const [intakeDone, setIntakeDone] = useState(false);
  const [urgency, setUrgency] = useState<{ level: 0 | 1 | 2 | 3; redFlags: string[] }>({
    level: 0,
    redFlags: [],
  });

  useEffect(() => {
    const b = readBooking();
    if (b.symptom) setSymptom(b.symptom);
    if (b.note) setNote(b.note);
    const d = readDraft();
    const has = Object.keys(d.answers ?? {}).length > 0;
    setIntakeDone(has);
    if (has) setUrgency(scoreUrgency(d.answers));
  }, []);

  useEffect(() => {
    if (phase !== "pay" || pay !== "idle") return;
    if (left <= 0) {
      setPay("expired");
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, pay, left]);

  const doctor = useMemo<Doctor | undefined>(
    () => doctors.find((d) => d.id === doctorId),
    [doctorId],
  );

  const stepIndex = { reason: 0, doctor: 1, review: 2, pay: 3, done: 3 }[phase];
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  return (
    <FocusShell
      center={<StepProgress steps={STEPS} current={stepIndex} />}
      exitHref="/dashboard"
    >
      {phase === "reason" && (
        <div>
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

          <div className="mt-6 flex items-start gap-2.5 rounded-[--radius-md] border border-border bg-surface-muted p-3 text-xs text-muted-foreground-strong">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-triage-review" />
            If this is a sudden loss of vision, severe pain, or an injury, seek
            in-person emergency care now — don&apos;t wait for a booking.
          </div>

          <div className="mt-6 rounded-[--radius-lg] border border-border bg-surface p-4">
            {intakeDone ? (
              <p className="flex items-center gap-2 text-sm text-triage-normal-fg">
                <Check className="size-4" strokeWidth={2.5} />
                Guided self-test complete — it&apos;ll be attached to this booking.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground-strong">
                  Next: a 5-minute self-test (vision check, questions, photos).
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/intake/questionnaire">Start self-test</Link>
                </Button>
              </div>
            )}
          </div>

          <FlowNav
            onBack={() => router.push("/dashboard")}
            backLabel="Cancel"
            onNext={() => setPhase("doctor")}
            nextDisabled={!symptom || !intakeDone}
            nextLabel={intakeDone ? "Continue" : "Complete self-test first"}
          />
        </div>
      )}

      {phase === "doctor" && (
        <div>
          <h1 className="text-2xl">Choose a doctor and time</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All doctors are registered ophthalmologists.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {doctors.map((d) => (
              <div
                key={d.id}
                className={cn(
                  "rounded-[--radius-lg] border bg-surface p-5 transition-colors",
                  doctorId === d.id ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-[--radius-md] bg-surface-muted text-muted-foreground">
                    <Stethoscope className="size-[18px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-heading">
                      {d.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.specialty}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Languages className="size-3.5" />
                      {d.languages.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {groupSlotsByDay(d.slots).map(([day, slots]) => (
                    <div key={day}>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground-strong">
                        {day}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((s) => {
                          const active = doctorId === d.id && slot === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                setDoctorId(d.id);
                                setSlot(s);
                              }}
                              className={cn(
                                "rounded-[--radius-sm] border px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-foreground hover:bg-primary-subtle",
                              )}
                            >
                              {new Date(s).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <FlowNav
            onBack={() => setPhase("reason")}
            onNext={() => setPhase("review")}
            nextDisabled={!doctorId || !slot}
          />
        </div>
      )}

      {phase === "review" && (
        <div>
          <h1 className="text-2xl">Review and confirm</h1>

          {urgency.redFlags.length ? (
            <EmergencyBanner className="mt-5">
              Your self-test flagged{" "}
              {urgency.redFlags.map((f) => f.toLowerCase()).join(", ")}. Please
              also seek in-person emergency care. This booking will proceed with
              the flag visible to the doctor.
            </EmergencyBanner>
          ) : null}

          <dl className="mt-6 divide-y divide-border rounded-[--radius-lg] border border-border bg-surface">
            <Row label="Reason">
              {symptom}
              {note ? <span className="text-muted-foreground"> — {note}</span> : null}
            </Row>
            <Row label="Doctor">
              {doctor?.name}{" "}
              <span className="text-muted-foreground">· {doctor?.specialty}</span>
            </Row>
            <Row label="Time">
              <span className="font-mono tabular-nums">{fmtSlot(slot)}</span>
            </Row>
            <Row label="Triage">
              <TriageBadge state={TRIAGE_STATE[urgency.level]} />
            </Row>
            <Row label="Price">
              <span className="font-mono tabular-nums">₹{CONSULT_PRICE}</span>{" "}
              <span className="text-muted-foreground">incl. taxes</span>
            </Row>
          </dl>

          <Label className="mt-5 flex items-start gap-3 font-normal">
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
            onNext={() => {
              setLeft(HOLD_SECONDS);
              setPay("idle");
              setPhase("pay");
            }}
            nextDisabled={!consent}
            nextLabel="Continue to payment"
          />
        </div>
      )}

      {phase === "pay" && pay === "expired" && (
        <div>
          <h1 className="text-2xl">Your slot was released</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The hold expired before payment completed. Pick a time again — it&apos;s
            usually still available.
          </p>
          <Button
            className="mt-6 bg-cta text-cta-foreground hover:bg-cta-hover"
            onClick={() => setPhase("doctor")}
          >
            Choose a time
          </Button>
        </div>
      )}

      {phase === "pay" && pay !== "expired" && (
        <div>
          <h1 className="text-2xl">Payment</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-triage-review-bg px-3 py-1 font-mono text-xs text-triage-review-fg">
            <Clock className="size-3.5" />
            Slot held — {mm}:{ss}
          </div>

          <div className="mt-6 rounded-[--radius-lg] border border-border bg-surface p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Consultation</span>
              <span className="font-mono tabular-nums">₹{CONSULT_PRICE}.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-medium text-heading">
              <span>Total</span>
              <span className="font-mono tabular-nums">₹{CONSULT_PRICE}.00</span>
            </div>
          </div>

          {pay === "failed" ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
              <CircleAlert className="size-4" />
              Payment didn&apos;t go through. Your slot is still held — try again.
            </p>
          ) : null}

          <Button
            className="mt-6 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={pay === "processing"}
            onClick={() => {
              setPay("processing");
              setTimeout(() => {
                setPay("idle");
                setPhase("done");
              }, 1400);
            }}
          >
            {pay === "processing"
              ? "Processing…"
              : `Pay ₹${CONSULT_PRICE} with Razorpay`}
          </Button>
          <button
            className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-heading"
            onClick={() => setPay("failed")}
          >
            Simulate a failed payment
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-triage-normal-bg text-triage-normal-fg">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-2xl">Booking confirmed</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Reference{" "}
            <span className="font-mono text-foreground">
              CS-{String(Date.now()).slice(-6)}
            </span>
            . We&apos;ve sent the details to your WhatsApp. Your prescription will
            arrive there after the consult.
          </p>
          <dl className="mx-auto mt-6 max-w-sm divide-y divide-border rounded-[--radius-lg] border border-border bg-surface text-left">
            <Row label="Doctor">{doctor?.name}</Row>
            <Row label="Time">
              <span className="font-mono tabular-nums">{fmtSlot(slot)}</span>
            </Row>
          </dl>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
              <Link href="/dashboard">Add to calendar</Link>
            </Button>
          </div>
        </div>
      )}
    </FocusShell>
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
