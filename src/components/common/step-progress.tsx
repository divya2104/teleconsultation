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
    <ol className={cn("flex items-center gap-2.5", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                (done || active) && "bg-primary text-primary-foreground",
                !done && !active &&
                  "bg-primary-subtle text-primary-subtle-foreground",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                done || active ? "text-heading" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "mx-1 h-0.5 w-8 rounded-full transition-colors",
                  done ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
