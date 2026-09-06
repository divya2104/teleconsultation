import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  children,
  step,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  step?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[--radius-lg] border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-[--radius-md] bg-primary-subtle text-primary">
          <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
        </span>
        {step ? (
          <span className="font-mono text-xs text-muted-foreground">{step}</span>
        ) : null}
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold text-heading">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
