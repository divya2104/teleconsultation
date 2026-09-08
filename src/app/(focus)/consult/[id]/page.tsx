import { notFound } from "next/navigation";
import { FocusShell } from "@/components/layout/focus-shell";
import { PatientConsultRoom } from "@/components/consult/patient-consult-room";
import { getAppointment } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = await getAppointment(id);
  if (!appt) notFound();
  return (
    <FocusShell exitHref="/dashboard" exitLabel="Leave call" containerSize="content">
      <PatientConsultRoom appt={appt} />
    </FocusShell>
  );
}
