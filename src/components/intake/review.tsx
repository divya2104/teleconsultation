"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { TriageBadge } from "@/components/common/triage-badge";
import { Panel, StatTile } from "@/components/intake/question-fields";
import { QUESTIONS, scoreUrgency } from "@/lib/mock/intake";
import { readDraft, clearDraft, type IntakeDraft } from "@/lib/intake-store";
import { summary } from "@/lib/acuity";
import { submitDraftTriage } from "@/lib/db/client-api";

const LEVEL_TO_STATE = ["normal", "review", "review", "urgent"] as const;

function labelFor(qid: string, value: string) {
  const q = QUESTIONS.find((x) => x.id === qid);
  return q?.options?.find((o) => o.value === value)?.label ?? value;
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border py-6 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-heading">
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function KeyValueRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="grid gap-x-8 gap-y-1 py-1.5 text-sm sm:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <dt className="text-primary">{q}</dt>
      <dd className="text-heading">{a}</dd>
    </div>
  );
}

export function Review() {
  const router = useRouter();
  const params = useSearchParams();
  const free = usePathname().startsWith("/eye-test");
  const appt = params.get("appt");
  const [draft, setDraft] = useState<IntakeDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  if (!draft) return null;

  const { level, redFlags } = scoreUrgency(draft.answers);

  const submit = () => {
    if (submitting) return false;
    if (!appt) {
      toast.error("Missing booking reference — return to your dashboard.");
      return false;
    }
    setSubmitting(true);
    void (async () => {
      const res = await submitDraftTriage(appt, readDraft());
      if (!res.ok) {
        setSubmitting(false);
        toast.error(res.error ?? "Couldn't submit the self-test.");
        return;
      }
      clearDraft();
      toast.success("Self-test submitted — your doctor will have this ready");
      router.push(`/booking-confirmed?appt=${appt}`);
    })();
    return false; // NavButtons: we navigate ourselves on success
  };

  return (
    <>
      <Panel>
        <h1 className="text-2xl">{free ? "Your triage summary" : "Review your self-test"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {free
            ? "A screening summary, not a diagnosis. Book a consultation and your ophthalmologist opens the call with this ready — no need to repeat the test."
            : "This becomes the triage summary your doctor opens the consult with."}
        </p>

        <div className="mt-8 flex flex-col">
          <Section
            title="Provisional urgency"
            aside={<TriageBadge state={LEVEL_TO_STATE[level]} />}
          >
            {redFlags.length ? (
              <p className="text-sm text-triage-urgent-fg">
                Flagged: {redFlags.join(", ")}. Advised to seek in-person
                emergency care; booking continues with this flag.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No emergency red-flag phrases detected.
              </p>
            )}
          </Section>

          <Section title="Your answers">
            <dl className="space-y-2">
              {QUESTIONS.map((q) => {
                const a = draft.answers[q.id];
                if (!a || (Array.isArray(a) && !a.length)) return null;
                const text = Array.isArray(a)
                  ? a.map((v) => labelFor(q.id, v)).join(", ")
                  : q.type === "text"
                    ? (a as string)
                    : labelFor(q.id, a as string);
                return <KeyValueRow key={q.id} q={q.text} a={text} />;
              })}
            </dl>
          </Section>

          <Section title="Eye test">
            {draft.acuity?.skipped ? (
              <p className="text-sm text-muted-foreground">Skipped — the doctor will check your vision in the consult.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label={`Distance R · ${draft.acuity?.meters ?? 3} m`} value={summary(draft.acuity?.distance?.right)} />
                <StatTile label={`Distance L · ${draft.acuity?.meters ?? 3} m`} value={summary(draft.acuity?.distance?.left)} />
                <StatTile label="Near R · 40 cm" value={summary(draft.acuity?.near?.right)} />
                <StatTile label="Near L · 40 cm" value={summary(draft.acuity?.near?.left)} />
              </div>
            )}
          </Section>

          <Section title="Photos">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => {
                const src = draft.photos?.[i];
                return src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Eye photo ${i + 1}`}
                    className="size-20 rounded-[var(--radius-md)] border border-border object-cover"
                  />
                ) : (
                  <div
                    key={i}
                    className="grid size-20 place-items-center rounded-[var(--radius-md)] border border-border bg-surface-muted text-muted-foreground"
                  >
                    <Camera className="size-5" strokeWidth={1.5} />
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </Panel>

      {free ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 bg-cta px-6 text-cta-foreground hover:bg-cta-hover">
            <Link href="/book">
              Book a consultation with a doctor
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/">Not now</Link>
          </Button>
        </div>
      ) : (
        <NavButtons
          step="review"
          canContinue={!submitting}
          continueLabel={submitting ? "Submitting…" : "Submit self-test"}
          onContinue={submit}
        />
      )}
    </>
  );
}
