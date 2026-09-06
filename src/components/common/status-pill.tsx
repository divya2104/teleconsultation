import { cn } from "@/lib/utils";
import type { ApptStatus } from "@/lib/mock/patient";

const MAP: Record<ApptStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-primary-subtle text-primary-subtle-foreground" },
  live: { label: "Live now", className: "bg-triage-normal-bg text-triage-normal-fg" },
  completed: { label: "Completed", className: "bg-surface-muted text-muted-foreground-strong" },
  cancelled: { label: "Cancelled", className: "bg-surface-muted text-muted-foreground-strong" },
  "no-show": { label: "No-show", className: "bg-triage-review-bg text-triage-review-fg" },
};

export function StatusPill({
  status,
  className,
}: {
  status: ApptStatus;
  className?: string;
}) {
  const { label, className: tone } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
