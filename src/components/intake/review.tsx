"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { QUESTIONS, scoreUrgency } from "@/lib/mock/intake";
import { readDraft, clearDraft, type IntakeDraft } from "@/lib/intake-store";

const LEVEL_TO_STATE = ["normal", "review", "review", "urgent"] as const;

function labelFor(qid: string, value: string) {
  const q = QUESTIONS.find((x) => x.id === qid);
  return q?.options?.find((o) => o.value === value)?.label ?? value;
}

export function Review() {
  const router = useRouter();
  const [draft, setDraft] = useState<IntakeDraft | null>(null);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  if (!draft) return null;

  const { level, redFlags } = scoreUrgency(draft.answers);

  const submit = () => {
    // ponytail: no backend yet — clear the draft and hand back to booking.
    clearDraft();
    toast.success("Self-test submitted — added to your booking");
    router.push("/book");
    return false; // NavButtons has no next step anyway
  };

  return (
    <div>
      <h1 className="text-2xl">Review your self-test</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This becomes the triage summary your doctor opens the consult with.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-heading">
              Provisional urgency
            </h2>
            <TriageBadge state={LEVEL_TO_STATE[level]} />
          </div>
          {redFlags.length ? (
            <p className="mt-2 text-sm text-triage-urgent-fg">
              Flagged: {redFlags.join(", ")}. Advised to seek in-person emergency
              care; booking continues with this flag.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No emergency red-flag phrases detected.
            </p>
          )}
        </section>

        <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <h2 className="font-heading text-base font-semibold text-heading">
            Your answers
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {QUESTIONS.map((q) => {
              const a = draft.answers[q.id];
              if (!a || (Array.isArray(a) && !a.length)) return null;
              const text = Array.isArray(a)
                ? a.map((v) => labelFor(q.id, v)).join(", ")
                : q.type === "text"
                  ? (a as string)
                  : labelFor(q.id, a as string);
              return (
                <div key={q.id} className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="shrink-0 text-muted-foreground sm:w-56">{q.text}</dt>
                  <dd className="text-foreground">{text}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <h2 className="font-heading text-base font-semibold text-heading">
            Vision check
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-[--radius-sm] border border-border p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Right eye
              </p>
              <p className="mt-1 font-mono text-lg tabular-nums text-heading">
                {draft.acuity?.right || "—"}
              </p>
            </div>
            <div className="rounded-[--radius-sm] border border-border p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Left eye
              </p>
              <p className="mt-1 font-mono text-lg tabular-nums text-heading">
                {draft.acuity?.left || "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <h2 className="font-heading text-base font-semibold text-heading">
            Photos
          </h2>
          {draft.photos?.length ? (
            <div className="mt-3 flex gap-3">
              {draft.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Eye photo ${i + 1}`}
                  className="size-20 rounded-[--radius-sm] border border-border object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No photos added.</p>
          )}
        </section>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        <Button variant="ghost" onClick={() => router.push("/intake/photos")}>
          Back
        </Button>
        <Button
          onClick={submit}
          className="bg-cta text-cta-foreground hover:bg-cta-hover"
        >
          Submit self-test
        </Button>
      </div>
    </div>
  );
}
