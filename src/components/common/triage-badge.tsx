import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TriageState = "normal" | "review" | "urgent";

const MAP: Record<
  TriageState,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  normal: {
    label: "Routine",
    Icon: CheckCircle2,
    className: "bg-triage-normal-bg text-triage-normal-fg",
  },
  review: {
    label: "Needs review",
    Icon: AlertTriangle,
    className: "bg-triage-review-bg text-triage-review-fg",
  },
  urgent: {
    label: "Urgent",
    Icon: AlertOctagon,
    className: "bg-triage-urgent-bg text-triage-urgent-fg",
  },
};

/** State never rides on colour alone — always icon + word. */
export function TriageBadge({
  state,
  className,
}: {
  state: TriageState;
  className?: string;
}) {
  const { label, Icon, className: tone } = MAP[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}
