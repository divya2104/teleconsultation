"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorsTab } from "@/components/admin/doctors-tab";
import { BookingsTab } from "@/components/admin/bookings-tab";
import { PaymentsTab } from "@/components/admin/payments-tab";
import { AnalyticsTab } from "@/components/admin/analytics-tab";

const TABS = ["doctors", "bookings", "payments", "analytics"] as const;
type Tab = (typeof TABS)[number];

export function AdminConsole() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "doctors";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin console"
        description="Doctor verification, bookings, payments and analytics."
      />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/admin?tab=${v}`)}>
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="pt-6">
          <DoctorsTab />
        </TabsContent>
        <TabsContent value="bookings" className="pt-6">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="payments" className="pt-6">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="analytics" className="pt-6">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
