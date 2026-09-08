import { notFound } from "next/navigation";
import { FocusShell } from "@/components/layout/focus-shell";
import { ConsultRoom } from "@/components/doctor/consult-room";
import { getTriageForConsult } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTriageForConsult(id);
  if (!data) notFound();

  return (
    <FocusShell
      exitHref="/doctor/dashboard"
      exitLabel="Leave call"
      containerSize="content"
    >
      <ConsultRoom id={id} triage={data.record} photoUrls={data.photoUrls} />
    </FocusShell>
  );
}
