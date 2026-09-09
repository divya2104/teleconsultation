import { cn } from "@/lib/utils";

const MAX = {
  content: "max-w-[var(--container-content)]",
  wide: "max-w-[var(--container-wide)]",
  prose: "max-w-[40rem]",
} as const;

export function Container({
  size = "content",
  className,
  children,
}: {
  size?: keyof typeof MAX;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // Global horizontal gutter: 10px floor on the smallest screens,
        // scaling up. This is the one place page padding is set.
        "mx-auto w-full px-2.5 sm:px-4 md:px-6 lg:px-8",
        MAX[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
