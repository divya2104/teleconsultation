"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { NavButtons } from "@/components/intake/nav-buttons";
import { QUESTIONS, scoreUrgency, type Answers } from "@/lib/mock/intake";
import { readDraft, writeDraft } from "@/lib/intake-store";
import { cn } from "@/lib/utils";

export function Questionnaire() {
  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    setAnswers(readDraft().answers ?? {});
  }, []);

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
    <div>
      <h1 className="text-2xl">Tell us what&apos;s going on</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A few questions so your doctor knows what to look at first.
      </p>

      {redFlags.length ? (
        <EmergencyBanner className="mt-5">
          Your answers mention {redFlags.map((f) => f.toLowerCase()).join(", ")}.
          This can be an eye emergency — seek in-person emergency eye care now. You
          can still book; the doctor will see this flag.
        </EmergencyBanner>
      ) : null}

      <div className="mt-6 flex flex-col gap-7">
        {QUESTIONS.map((q) => (
          <fieldset key={q.id}>
            <legend className="text-sm font-medium text-heading">{q.text}</legend>

            {q.type === "single" && q.options ? (
              <RadioGroup
                className="mt-3 gap-2"
                value={(answers[q.id] as string) ?? ""}
                onValueChange={(v) => set(q.id, v)}
              >
                {q.options.map((o) => (
                  <Label
                    key={o.value}
                    htmlFor={`${q.id}-${o.value}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-[--radius-md] border border-border px-3 py-2.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-subtle",
                      o.redFlag && "has-[[data-state=checked]]:border-triage-urgent has-[[data-state=checked]]:bg-triage-urgent-bg",
                    )}
                  >
                    <RadioGroupItem id={`${q.id}-${o.value}`} value={o.value} />
                    {o.label}
                  </Label>
                ))}
              </RadioGroup>
            ) : null}

            {q.type === "multi" && q.options ? (
              <div className="mt-3 flex flex-col gap-2">
                {q.options.map((o) => {
                  const checked =
                    Array.isArray(answers[q.id]) &&
                    (answers[q.id] as string[]).includes(o.value);
                  return (
                    <Label
                      key={o.value}
                      htmlFor={`${q.id}-${o.value}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[--radius-md] border border-border px-3 py-2.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-subtle",
                        o.redFlag && "has-[[data-state=checked]]:border-triage-urgent has-[[data-state=checked]]:bg-triage-urgent-bg",
                      )}
                    >
                      <Checkbox
                        id={`${q.id}-${o.value}`}
                        checked={checked}
                        onCheckedChange={() => toggleMulti(q.id, o.value)}
                      />
                      {o.label}
                    </Label>
                  );
                })}
              </div>
            ) : null}

            {q.type === "text" ? (
              <Input
                className="mt-3"
                placeholder="Optional"
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
              />
            ) : null}
          </fieldset>
        ))}
      </div>

      <p className="mt-6 font-mono text-xs text-muted-foreground">
        Provisional urgency: {["routine", "review", "review", "urgent"][level]}
      </p>

      <NavButtons step="questionnaire" canContinue={answered} />
    </div>
  );
}
