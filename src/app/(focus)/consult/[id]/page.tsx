import { FocusShell } from "@/components/layout/focus-shell";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FocusShell exitHref="/dashboard" exitLabel="Leave call" containerSize="content">
      <PagePlaceholder title={`Video consult ${id}`} note="Device check → waiting → live call → audio-only fallback / reschedule. Step 5." />
    </FocusShell>
  );
}
