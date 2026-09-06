import { AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Red-flag alert. role="alert", static (no pulse) under reduced motion —
 * handled globally in globals.css. Shown in intake + booking when the
 * questionnaire hits an emergency keyword. Booking still proceeds, flagged.
 */
export function EmergencyBanner({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-[--radius-md] border border-triage-urgent bg-triage-urgent-bg p-4 text-sm font-semibold text-triage-urgent-fg",
        className,
      )}
    >
      <AlertOctagon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
      <span>
        {children ??
          "Your answers suggest a possible eye emergency. Seek in-person emergency eye care now. You can still book, and the doctor will see this flag."}
      </span>
    </div>
  );
}
