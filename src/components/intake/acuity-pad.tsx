"use client";

import { useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Answer, Dir } from "@/lib/acuity";

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowLeft: "left",
};

/** Four ≥44 px arrows + "Can't see it". Arrow keys work while mounted. */
export function AcuityPad({
  onAnswer,
  disabled,
  hint,
  dark,
}: {
  onAnswer: (a: Answer) => void;
  disabled?: boolean;
  hint?: string;
  /** Neutral (chart-overlay) styling instead of theme tokens. */
  dark?: boolean;
}) {
  useEffect(() => {
    if (disabled) return;
    const h = (e: KeyboardEvent) => {
      const d = KEY_TO_DIR[e.key];
      if (d) {
        e.preventDefault();
        onAnswer(d);
      } else if (e.key === "c" || e.key === "C") {
        onAnswer("cant");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onAnswer, disabled]);

  const arrow = (dir: Dir, Icon: typeof ArrowUp) => (
    <Arrow dir={dir} Icon={Icon} disabled={disabled} dark={dark} onAnswer={onAnswer} />
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {hint ? <p className={cn("text-xs", dark ? "text-neutral-600" : "text-muted-foreground")}>{hint}</p> : null}
      <div className="grid grid-cols-3 grid-rows-3 gap-2">
        <span />
        {arrow("up", ArrowUp)}
        <span />
        {arrow("left", ArrowLeft)}
        <span className={cn("size-14 rounded-full", dark ? "bg-neutral-100" : "bg-surface-muted")} />
        {arrow("right", ArrowRight)}
        <span />
        {arrow("down", ArrowDown)}
        <span />
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer("cant")}
        className={cn(
          "mt-1 inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm disabled:opacity-40",
          dark
            ? "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            : "border-border text-muted-foreground-strong hover:bg-surface-muted",
        )}
      >
        <EyeOff className="size-4" />
        Can&apos;t see it
      </button>
    </div>
  );
}

function Arrow({
  dir,
  Icon,
  disabled,
  dark,
  onAnswer,
}: {
  dir: Dir;
  Icon: typeof ArrowUp;
  disabled?: boolean;
  dark?: boolean;
  onAnswer: (a: Answer) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`E points ${dir}`}
      disabled={disabled}
      onClick={() => onAnswer(dir)}
      className={cn(
        "grid size-14 place-items-center rounded-full border text-lg transition-colors disabled:opacity-40",
        dark
          ? "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
          : "border-border bg-surface text-heading hover:bg-primary-subtle",
      )}
    >
      <Icon className="size-6" />
    </button>
  );
}
