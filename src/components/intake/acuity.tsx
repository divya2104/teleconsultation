"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { Panel, StatTile } from "@/components/intake/question-fields";
import { ACUITY_ROWS } from "@/lib/mock/intake";
import { readDraft, writeDraft } from "@/lib/intake-store";

type Phase = "calibrate" | "right" | "left" | "done";

export function Acuity() {
  const [phase, setPhase] = useState<Phase>("calibrate");
  const [right, setRight] = useState<string>("");
  const [left, setLeft] = useState<string>("");

  useEffect(() => {
    const d = readDraft().acuity;
    if (d) {
      setRight(d.right);
      setLeft(d.left);
      if (d.right && d.left) setPhase("done");
    }
  }, []);

  const persist = (r: string, l: string) =>
    writeDraft({ acuity: { right: r, left: l, distanceOk: true } });

  if (phase === "calibrate") {
    return (
      <>
        <Panel>
          <h1 className="text-3xl">Set up your vision check</h1>
          <p className="mt-2 text-base text-muted-foreground">
            This is a screening measure, not a formal eye test.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-foreground">
            <li>1. Put on your glasses or contacts if you normally wear them.</li>
            <li>
              2. Hold your phone at arm&apos;s length — about 40&nbsp;cm from your
              face.
            </li>
            <li>3. Find a well-lit spot without glare on the screen.</li>
            <li>
              4. You&apos;ll cover one eye at a time and read down as far as you
              can.
            </li>
          </ol>
          <label className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-border p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              onChange={(e) => e.target.checked && setPhase("right")}
            />
            I&apos;m set up and ready to start with my right eye
          </label>
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (phase === "done") {
    return (
      <>
        <Panel>
          <h1 className="text-3xl">Vision check complete</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Screening result — your doctor will confirm.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatTile label="Right eye" value={right} size="lg" />
            <StatTile label="Left eye" value={left} size="lg" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-primary hover:text-primary"
            onClick={() => {
              setRight("");
              setLeft("");
              persist("", "");
              setPhase("right");
            }}
          >
            Redo the check
          </Button>
        </Panel>
        <NavButtons step="acuity" />
      </>
    );
  }

  const eye = phase === "right" ? "right" : "left";

  return (
    <>
      <Panel>
        <h1 className="text-3xl">
          Cover your {eye === "right" ? "left" : "right"} eye
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Reading with your <strong>{eye}</strong> eye, tap the smallest row you
          can read clearly.
        </p>

        <div className="mt-6 flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-border p-3">
          {ACUITY_ROWS.map((row, i) => (
            <button
              key={row.snellen}
              onClick={() => {
                if (eye === "right") {
                  setRight(row.snellen);
                  persist(row.snellen, left);
                  setPhase("left");
                } else {
                  setLeft(row.snellen);
                  persist(right, row.snellen);
                  setPhase("done");
                }
              }}
              className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left transition-colors hover:bg-primary-subtle"
            >
              <span
                className="font-mono font-medium tracking-[0.3em] text-heading"
                style={{ fontSize: `${34 - i * 3.5}px`, lineHeight: 1 }}
              >
                {row.letters}
              </span>
              <span className="ml-4 shrink-0 font-mono text-xs text-muted-foreground">
                {row.snellen}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-triage-normal" />
          Can&apos;t read the top row? Pick it anyway and tell the doctor.
        </p>
      </Panel>
      <NavButtons step="acuity" canContinue={false} />
    </>
  );
}
