import { FocusShell } from "@/components/layout/focus-shell";
import { ConsultRoom } from "@/components/doctor/consult-room";

import { queue } from "@/lib/mock/doctor";

export function generateStaticParams() {
  return queue.map((q) => ({ id: q.id }));
}

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
