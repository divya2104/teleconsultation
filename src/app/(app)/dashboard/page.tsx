import { Suspense } from "react";
import { DashboardTabs } from "@/components/patient/dashboard-tabs";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardTabs />
    </Suspense>
  );
}
