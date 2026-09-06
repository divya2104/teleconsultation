import { cn } from "@/lib/utils";

/** Mono value + uppercase label — acuity, Rx codes, timestamps, IDs. */
export function DataField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[--radius-sm] border border-border p-3", className)}>
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-medium tabular-nums text-heading">
        {value}
      </div>
    </div>
  );
}
