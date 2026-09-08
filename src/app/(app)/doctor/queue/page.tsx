import { QueueClient } from "@/components/doctor/queue-client";
import { doctorQueue } from "@/lib/db/queries";

export const metadata = { title: "Consult queue" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await doctorQueue();
  return <QueueClient items={items} />;
}
