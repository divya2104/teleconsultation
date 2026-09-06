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
    <div className={cn("mx-auto w-full px-4 md:px-6 lg:px-8", MAX[size], className)}>
      {children}
    </div>
  );
}
