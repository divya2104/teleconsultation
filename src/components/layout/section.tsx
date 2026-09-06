import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-16 md:py-20 lg:py-24", className)} {...props}>
      {children}
    </section>
  );
}
