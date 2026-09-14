"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isSkipped, summary, type EyeOrSkipped } from "@/lib/acuity";

const TICKS = ["6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
const SWEEP_MS = 1600;

/** 6/60 (logMAR 1.0) at 0 % … 6/6 (0.0) at 100 %. */
export function gaugePos(logMAR: number): number {
  return Math.max(0, Math.min(100, (1 - logMAR) * 100));
}

/** Plain-language band. Low scores are "worth a check", never a failure. */
export function band(e: EyeOrSkipped | undefined): { label: string; tone: "normal" | "good" | "review" } | null {
  if (!e || isSkipped(e)) return null;
  if (e.terminated === "belowRange") return { label: "Worth a check", tone: "review" };
  if (e.logMAR <= 0.1) return { label: "Sharp", tone: "normal" };
  if (e.logMAR <= 0.3) return { label: "Good", tone: "good" };
  return { label: "Worth a check", tone: "review" };
}

const TONE = {
  normal: "bg-triage-normal-bg text-triage-normal-fg",
  good: "bg-primary-subtle text-primary-subtle-foreground",
  review: "bg-triage-review-bg text-triage-review-fg",
};

/**
 * Animated acuity gauge: the needle sweeps from 6/60 to the result after
 * `delayMs`, then the score and band fade in. Reduced motion → final state.
 */
export function ScoreGauge({
  label,
  mark,
  eye,
  delayMs = 0,
}: {
  label: string;
  /** Letter inside the needle (R / L). */
  mark: string;
  eye: EyeOrSkipped | undefined;
  delayMs?: number;
}) {
  const skipped = !eye || isSkipped(eye);
  const target = skipped ? 0 : gaugePos(eye.terminated === "belowRange" ? 1 : eye.logMAR);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(rm);
    if (rm || skipped) {
      setPos(target);
      setShown(true);
      return;
    }
    const t1 = setTimeout(() => setPos(target), delayMs + 50);
    const t2 = setTimeout(() => setShown(true), delayMs + SWEEP_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [target, delayMs, skipped]);

  const b = band(eye);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-heading">{label}</span>
        <span
          className="inline-flex items-center gap-2 transition-opacity duration-500"
          style={{ opacity: shown ? 1 : 0 }}
        >
          <span className="font-mono text-xl font-semibold tabular-nums text-heading">{summary(eye)}</span>
          {b ? (
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[b.tone])}>{b.label}</span>
          ) : null}
        </span>
      </div>
      <div
        className="relative h-3 rounded-full"
        style={{ background: "linear-gradient(90deg,#c53d2f 0%,#e4903d 38%,#b9c24a 60%,#5f9c5b 80%,#2f6b45 100%)" }}
        role="img"
        aria-label={`${label}: ${summary(eye)}${b ? `, ${b.label}` : ""}`}
      >
        {!skipped ? (
          <span
            className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-primary bg-surface font-mono text-[10px] font-semibold text-primary"
            style={{
              left: `${pos}%`,
              boxShadow: "var(--shadow-sm)",
              transition: reduce ? "none" : `left ${SWEEP_MS}ms cubic-bezier(.16,1,.3,1)`,
            }}
          >
            {mark}
          </span>
        ) : null}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        {TICKS.map((t) => <span key={t}>{t}</span>)}
      </div>
    </div>
  );
}
