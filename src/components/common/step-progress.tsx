import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Numbered intake / booking steps. current = 0-based index. */
export function StepProgress({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-colors",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary-subtle text-primary-subtle-foreground ring-1 ring-border-brand",
                !done && !active && "bg-surface-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                active ? "text-heading" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 h-px w-6 bg-border" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
