import { QueueClient } from "@/components/doctor/queue-client";

export const metadata = { title: "Consult queue" };

export default function Page() {
  return <QueueClient />;
}
