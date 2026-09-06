import { FocusShell } from "@/components/layout/focus-shell";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FocusShell exitHref="/doctor/dashboard" exitLabel="Leave call" containerSize="content">
      <PagePlaceholder title={`Consult ${id} — doctor view`} note="Video + triage panel + structured e-prescription form → PDF + delivery + recall. Step 5." />
    </FocusShell>
  );
}
