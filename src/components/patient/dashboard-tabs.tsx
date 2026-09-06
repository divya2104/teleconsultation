"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, FileText, BellRing } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PagePlaceholder } from "@/components/common/page-placeholder";

const TABS = ["overview", "appointments", "prescriptions", "recalls"] as const;
type Tab = (typeof TABS)[number];

export function DashboardTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "overview";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Your dashboard"
        description="Appointments, prescriptions and recall reminders in one place."
        actions={<Button className="bg-cta text-cta-foreground hover:bg-cta-hover">Book a consult</Button>}
      />

      <Tabs
        value={tab}
        onValueChange={(v) =>
          router.replace(v === "overview" ? "/dashboard" : `/dashboard?tab=${v}`)
        }
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="recalls">Recalls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <PagePlaceholder title="Overview" note="Next appointment, pending intake nudge, next recall. Step 5." />
        </TabsContent>
        <TabsContent value="appointments" className="pt-6">
          <EmptyState icon={CalendarDays} title="No appointments yet" hint="Book your first consultation to get started." action={<Button className="bg-cta text-cta-foreground hover:bg-cta-hover">Book a consult</Button>} />
        </TabsContent>
        <TabsContent value="prescriptions" className="pt-6">
          <EmptyState icon={FileText} title="No prescriptions yet" hint="Your e-prescriptions will appear here after a consultation." />
        </TabsContent>
        <TabsContent value="recalls" className="pt-6">
          <EmptyState icon={BellRing} title="No recall reminders" hint="After a consult, we schedule a personalized follow-up date." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
