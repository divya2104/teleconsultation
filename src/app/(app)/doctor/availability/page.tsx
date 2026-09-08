import { getMyAvailability } from "@/lib/db/queries";
import { AvailabilityEditor } from "@/components/doctor/availability-editor";

export const metadata = { title: "Availability" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getMyAvailability();
  return <AvailabilityEditor initial={initial} />;
}
