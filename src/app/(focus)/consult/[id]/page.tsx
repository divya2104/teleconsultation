import { FocusShell } from "@/components/layout/focus-shell";
import { PatientConsultRoom } from "@/components/consult/patient-consult-room";

import { appointments } from "@/lib/mock/patient";

export function generateStaticParams() {
  return appointments.map((a) => ({ id: a.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FocusShell exitHref="/dashboard" exitLabel="Leave call" containerSize="content">
      <PatientConsultRoom id={id} />
    </FocusShell>
  );
}
