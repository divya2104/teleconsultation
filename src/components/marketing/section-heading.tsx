import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto text-center",
        "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl">{title}</h2>
      {lead ? (
        <p className="mt-3 text-lg text-muted-foreground-strong">{lead}</p>
      ) : null}
    </div>
  );
}
