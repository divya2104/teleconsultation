import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

/**
 * FocusShell header — distraction-free. Center slot takes a <StepProgress>
 * (intake / booking) or a call timer (consult). Right slot: exit affordance.
 */
export function FocusHeader({
  center,
  exitHref = "/dashboard",
  exitLabel = "Save & exit",
}: {
  center?: React.ReactNode;
  exitHref?: string;
  exitLabel?: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
      <Logo size="sm" />
      <div className="flex flex-1 items-center justify-center">{center}</div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={exitHref}>{exitLabel}</Link>
      </Button>
    </header>
  );
}
