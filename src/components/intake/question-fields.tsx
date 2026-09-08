"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Opt = { value: string; label: string; redFlag?: boolean };

/** The white content card every intake step sits in, on the mint background. */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {children}
    </div>
  );
}

/** Bordered label/value stat tile (vision-check results, review summary). */
export function StatTile({
  label,
  value,
  size = "md",
}: {
  label: string;
  value: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border p-4">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono font-semibold tabular-nums text-heading",
          size === "lg" ? "text-4xl" : "text-3xl",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Horizontal wrapping pill group for single-select questions. */
export function PillGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              selected
                ? "border-primary bg-primary font-medium text-primary-foreground"
                : "border-border bg-surface text-heading hover:bg-surface-muted",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Bordered checkable row for multi-select lists. */
export function CheckOption({
  id,
  label,
  checked,
  onChange,
  redFlag,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  redFlag?: boolean;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex h-full cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-3.5 py-3 text-sm font-normal leading-snug transition-colors",
        checked
          ? redFlag
            ? "border-triage-urgent bg-triage-urgent-bg"
            : "border-primary bg-primary-subtle"
          : "border-border bg-surface hover:bg-surface-muted",
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 shrink-0"
      />
      <span>{label}</span>
    </Label>
  );
}
