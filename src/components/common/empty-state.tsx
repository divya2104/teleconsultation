import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[--radius-lg] border border-dashed border-border bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-surface-muted text-muted-foreground">
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </span>
      <p className="mt-4 font-heading text-base font-semibold text-heading">
        {title}
      </p>
      {hint ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
