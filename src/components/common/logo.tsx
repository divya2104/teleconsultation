import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  size = "md",
  tone = "default",
  className,
}: {
  href?: string;
  size?: "sm" | "md";
  tone?: "default" | "light";
  className?: string;
}) {
  const box = size === "sm" ? "size-7" : "size-8";
  const glyph = size === "sm" ? "size-4" : "size-[18px]";
  const text = size === "sm" ? "text-[15px]" : "text-base";
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 outline-none", className)}
      aria-label="ClearSight home"
    >
      <span
        className={cn(
          "grid place-items-center rounded-[--radius-sm] bg-primary text-primary-foreground shadow-sm",
          box,
        )}
      >
        <Eye className={glyph} strokeWidth={2} />
      </span>
      <span
        className={cn(
          "font-heading font-bold tracking-[-0.02em]",
          tone === "light" ? "text-white" : "text-heading",
          text,
        )}
      >
        ClearSight
      </span>
    </Link>
  );
}
