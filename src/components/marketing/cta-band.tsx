import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export function CtaBand({
  icon: Icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  variant = "primary",
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "primary" | "cta";
}) {
  return (
    <Container>
      <div className="flex flex-col items-start gap-6 rounded-[--radius-xl] border border-border bg-surface p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          {Icon ? (
            <Icon className="size-6 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          ) : null}
          <div>
            <h2 className="text-xl">{title}</h2>
            {body ? (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{body}</p>
            ) : null}
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className={cn(
            "h-11 shrink-0 px-6",
            variant === "cta" && "bg-cta text-cta-foreground hover:bg-cta-hover",
          )}
        >
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Container>
  );
}
