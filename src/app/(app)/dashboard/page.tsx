import { Suspense } from "react";
import { myAppointments } from "@/lib/db/queries";
import { DashboardTabs } from "@/components/patient/dashboard-tabs";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const appointments = await myAppointments();
  return (
    <Suspense fallback={null}>
      <DashboardTabs appointments={appointments} />
    </Suspense>
  );
}
