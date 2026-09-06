"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendarDays, FileText, BellRing } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import {
  AppointmentCard,
  PrescriptionCard,
  RecallCard,
} from "@/components/patient/cards";
import {
  appointments,
  prescriptions,
  recalls,
} from "@/lib/mock/patient";

const TABS = ["overview", "appointments", "prescriptions", "recalls"] as const;
type Tab = (typeof TABS)[number];

const upcoming = appointments.filter(
  (a) => a.status === "upcoming" || a.status === "live",
);
const past = appointments.filter(
  (a) => a.status !== "upcoming" && a.status !== "live",
);

export function DashboardTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "overview";

  const next = upcoming[0];
  const nextRecall = recalls.find((r) => r.status !== "done");
  const recentRx = prescriptions[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Your dashboard"
        description="Appointments, prescriptions and recall reminders in one place."
        actions={
          <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href="/book">Book a consult</Link>
          </Button>
        }
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

        <TabsContent value="overview" className="flex flex-col gap-6 pt-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
              Next consultation
            </h2>
            {next ? (
              <AppointmentCard appt={next} featured />
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming consultation"
                hint="Book a consult and complete the guided self-test."
                action={
                  <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
                    <Link href="/book">Book a consult</Link>
                  </Button>
                }
              />
            )}
          </section>

          {nextRecall ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
                Recall due
              </h2>
              <RecallCard recall={nextRecall} />
            </section>
          ) : null}

          {recentRx ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
                Most recent prescription
              </h2>
              <PrescriptionCard rx={recentRx} />
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="appointments" className="flex flex-col gap-6 pt-6">
          {upcoming.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground-strong">
                Upcoming
              </h2>
              {upcoming.map((a) => (
                <AppointmentCard key={a.id} appt={a} featured />
              ))}
            </section>
          ) : null}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground-strong">
              Past
            </h2>
            {past.length ? (
              past.map((a) => <AppointmentCard key={a.id} appt={a} />)
            ) : (
              <EmptyState icon={CalendarDays} title="No past appointments" />
            )}
          </section>
        </TabsContent>

        <TabsContent value="prescriptions" className="flex flex-col gap-3 pt-6">
          {prescriptions.length ? (
            prescriptions.map((rx) => <PrescriptionCard key={rx.id} rx={rx} />)
          ) : (
            <EmptyState
              icon={FileText}
              title="No prescriptions yet"
              hint="Your e-prescriptions appear here after a consultation."
            />
          )}
        </TabsContent>

        <TabsContent value="recalls" className="flex flex-col gap-3 pt-6">
          {recalls.length ? (
            recalls.map((r) => <RecallCard key={r.id} recall={r} />)
          ) : (
            <EmptyState
              icon={BellRing}
              title="No recall reminders"
              hint="After a consult we schedule a personalized follow-up date."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
