import { FocusShell } from "@/components/layout/focus-shell";
import { ConsultRoom } from "@/components/doctor/consult-room";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FocusShell
      exitHref="/doctor/dashboard"
      exitLabel="Leave call"
      containerSize="content"
    >
      <ConsultRoom id={id} />
    </FocusShell>
  );
}
