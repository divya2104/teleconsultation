import { FocusHeader } from "@/components/layout/focus-header";
import { Container } from "@/components/layout/container";

export function FocusShell({
  center,
  exitHref,
  exitLabel,
  containerSize = "prose",
  children,
}: {
  center?: React.ReactNode;
  exitHref?: string;
  exitLabel?: string;
  containerSize?: "prose" | "content";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <FocusHeader center={center} exitHref={exitHref} exitLabel={exitLabel} />
      <main className="flex-1 py-8 md:py-12">
        <Container size={containerSize}>{children}</Container>
      </main>
    </div>
  );
}
