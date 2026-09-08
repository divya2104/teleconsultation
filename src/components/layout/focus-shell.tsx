import { FocusHeader } from "@/components/layout/focus-header";
import { Container } from "@/components/layout/container";

export function FocusShell({
  center,
  exitHref,
  exitLabel,
  containerSize = "prose",
  fill = false,
  children,
}: {
  center?: React.ReactNode;
  exitHref?: string;
  exitLabel?: string;
  containerSize?: "prose" | "content" | "wide";
  /** Lock to the viewport height and let children own their scroll (page never scrolls). */
  fill?: boolean;
  children: React.ReactNode;
}) {
  if (fill) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <FocusHeader center={center} exitHref={exitHref} exitLabel={exitLabel} />
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    );
  }
  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader center={center} exitHref={exitHref} exitLabel={exitLabel} />
      <main className="flex-1 py-8 md:py-12">
        <Container size={containerSize}>{children}</Container>
      </main>
    </div>
  );
}
