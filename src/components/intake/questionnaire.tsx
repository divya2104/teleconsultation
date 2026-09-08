"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { NavButtons } from "@/components/intake/nav-buttons";
import { PillGroup, CheckOption } from "@/components/intake/question-fields";
import { QUESTIONS, scoreUrgency, type Answers } from "@/lib/mock/intake";
import { readDraft, writeDraft, clearDraft } from "@/lib/intake-store";
import { CONSULT_PRICE } from "@/lib/mock/doctors";
import { cn } from "@/lib/utils";

/** Questions that share a row on wide screens instead of spanning full width. */
const HALF_WIDTH = new Set(["which_eye", "contacts"]);

export function Questionnaire() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    setAnswers(readDraft().answers ?? {});
  }, []);

  const requestRefund = () => {
    clearDraft();
    toast.success(
      `Refund requested — ₹${CONSULT_PRICE} will be returned to your original payment method in 5–7 working days.`,
    );
    router.push("/dashboard");
  };

  const set = (id: string, value: string | string[]) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    writeDraft({ answers: next });
  };

  const toggleMulti = (id: string, value: string) => {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    set(id, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
  };

  const { level, redFlags } = scoreUrgency(answers);
  const answered = QUESTIONS.filter((q) => q.type !== "text").every((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : Boolean(a);
  });

  return (
    <>
      <div
        className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <h1 className="text-2xl">Tell us what&apos;s going on</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few questions so your doctor knows what to look at first.
        </p>

        {redFlags.length ? (
          <div className="mt-5 flex flex-col gap-3">
            <EmergencyBanner>
              Your answers mention{" "}
              {redFlags.map((f) => f.toLowerCase()).join(", ")}. This can be an eye
              emergency — seek in-person emergency care now, don&apos;t wait for the
              consult.
            </EmergencyBanner>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-triage-urgent text-triage-urgent-fg hover:bg-triage-urgent-bg"
                onClick={requestRefund}
              >
                Request a refund &amp; cancel
              </Button>
              <span className="text-xs text-muted-foreground">
                or continue below — your doctor will see this flag.
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
          {QUESTIONS.map((q) => (
            <div
              key={q.id}
              role="group"
              aria-label={q.text}
              className={cn(
                "min-w-0 border-t border-border py-6 first:border-t-0 first:pt-0 last:pb-0",
                HALF_WIDTH.has(q.id) ? "sm:col-span-1" : "sm:col-span-2",
              )}
            >
              <div className="mb-3 text-sm font-medium text-heading">
                {q.text}
              </div>

              {q.type === "single" && q.options ? (
                <PillGroup
                  ariaLabel={q.text}
                  options={q.options}
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(v) => set(q.id, v)}
                />
              ) : null}

              {q.type === "multi" && q.options ? (
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {q.options.map((o) => (
                    <CheckOption
                      key={o.value}
                      id={`${q.id}-${o.value}`}
                      label={o.label}
                      redFlag={o.redFlag}
                      checked={
                        Array.isArray(answers[q.id]) &&
                        (answers[q.id] as string[]).includes(o.value)
                      }
                      onChange={() => toggleMulti(q.id, o.value)}
                    />
                  ))}
                </div>
              ) : null}

              {q.type === "text" ? (
                <Input
                  placeholder="Optional"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => set(q.id, e.target.value)}
                />
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-xs text-muted-foreground">
          Provisional urgency: {["routine", "review", "review", "urgent"][level]}
        </p>
      </div>

      <NavButtons step="questionnaire" canContinue={answered} />
    </>
  );
}
