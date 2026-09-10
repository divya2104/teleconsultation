"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  FileText,
  BellRing,
  Plus,
  CalendarClock,
  Clock,
  Video,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { TriageBadge } from "@/components/common/triage-badge";
import { StatusPill } from "@/components/common/status-pill";
import {
  AppointmentCard,
  PrescriptionCard,
  RecallCard,
} from "@/components/patient/cards";
// TODO(mock): prescriptions + recalls are a backend follow-up
import {
  prescriptions,
  recalls,
  fmtDate,
  type Appointment,
  type Prescription,
  type Recall,
} from "@/lib/mock/patient";

const TABS = ["overview", "appointments", "prescriptions", "recalls"] as const;
type Tab = (typeof TABS)[number];

const tealBtn = "bg-primary text-primary-foreground hover:bg-primary/90";

export function DashboardTabs({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const router = useRouter();
  const upcoming = appointments.filter(
    (a) => a.status === "upcoming" || a.status === "live",
  );
  const past = appointments.filter(
    (a) => a.status !== "upcoming" && a.status !== "live",
  );
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "overview";

  const next = upcoming[0];
  const nextRecall = recalls.find((r) => r.status !== "done");
  const recentRx = prescriptions[0];

  return (
    <div className="flex flex-col gap-7">
      {/* header — larger, higher-contrast */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-bold leading-tight text-heading sm:text-3xl">
            Your dashboard
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Appointments, prescriptions and recall reminders in one place.
          </p>
        </div>
        <Button asChild className={`h-11 shrink-0 gap-1.5 px-5 text-base ${tealBtn}`}>
          <Link href="/book">
            <Plus className="size-5" strokeWidth={2.5} />
            Book a consult
          </Link>
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) =>
          router.replace(v === "overview" ? "/dashboard" : `/dashboard?tab=${v}`)
        }
      >
        <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
          {(
            [
              ["overview", "Overview"],
              ["appointments", "Appointments"],
              ["prescriptions", "Prescriptions"],
              ["recalls", "Recalls"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="h-auto flex-none rounded-b-none rounded-t-lg border-0 px-4 py-2.5 text-[15px] font-semibold text-muted-foreground data-active:bg-surface data-active:text-primary data-active:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-5 pt-7">
          {next ? (
            <NextConsultCard appt={next} />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming consultation"
              hint="Book a consult and complete the guided self-test."
              action={
                <Button asChild className={tealBtn}>
                  <Link href="/book">Book a consult</Link>
                </Button>
              }
            />
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {nextRecall ? <RecallOverviewCard recall={nextRecall} /> : null}
            {recentRx ? <RxOverviewCard rx={recentRx} /> : null}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="flex flex-col gap-6 pt-7">
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

        <TabsContent value="prescriptions" className="flex flex-col gap-3 pt-7">
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

        <TabsContent value="recalls" className="flex flex-col gap-3 pt-7">
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

/* ── overview cards (accessibility redesign) ────────────────────────────── */

function Eyebrow({
  children,
  tone = "teal",
}: {
  children: React.ReactNode;
  tone?: "teal" | "amber";
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.1em] ${
        tone === "amber" ? "text-triage-review" : "text-primary"
      }`}
    >
      {children}
    </p>
  );
}

function NextConsultCard({ appt }: { appt: Appointment }) {
  const joinable = appt.status === "upcoming" || appt.status === "live";
  const d = new Date(appt.start);
  const date = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border-[1.5px] border-border-brand bg-surface">
      <div className="h-1 bg-primary" />
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>Next consultation</Eyebrow>
            <p className="mt-1.5 text-xl font-bold text-heading">
              {appt.doctorName}
            </p>
            <p className="mt-0.5 text-base text-muted-foreground">
              {appt.reason}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <TriageBadge state={appt.triage} />
            <StatusPill status={appt.status} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-primary-subtle px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] font-medium text-primary-subtle-foreground">
            <span className="flex items-center gap-2">
              <CalendarClock className="size-[18px]" strokeWidth={2} />
              {date}
            </span>
            <span className="text-border-brand">·</span>
            <span className="flex items-center gap-2">
              <Clock className="size-[18px]" strokeWidth={2} />
              {time}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href={`/appointments/${appt.id}`}>Details</Link>
            </Button>
            {joinable ? (
              <Button asChild size="sm" className={`gap-2 ${tealBtn}`}>
                <Link href={`/consult/${appt.id}`}>
                  <Video className="size-4" />
                  Join
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {!appt.intakeComplete ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] bg-triage-review-bg px-4 py-3">
            <p className="text-sm font-medium text-triage-review-fg">
              Finish your self-test — your doctor opens the consult with it.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/intake/questionnaire?appt=${appt.id}`}>
                Finish self-test
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RecallOverviewCard({ recall }: { recall: Recall }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border-[1.5px] border-triage-review/40 bg-surface p-6">
      <Eyebrow tone="amber">Recall due</Eyebrow>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-triage-review-bg text-triage-review">
          <CalendarClock className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold leading-snug text-heading">
            {recall.reason}
          </p>
          <p className="mt-1 text-sm font-medium text-triage-review-fg">
            Due by {fmtDate(recall.dueDate)}
          </p>
        </div>
      </div>
      <Button asChild className={`mt-auto w-full ${tealBtn}`}>
        <Link href="/book">Book follow-up</Link>
      </Button>
    </div>
  );
}

function RxOverviewCard({ rx }: { rx: Prescription }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border-[1.5px] border-border-brand bg-surface p-6">
      <Eyebrow>Most recent prescription</Eyebrow>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-surface-muted text-muted-foreground">
          <FileText className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-heading">{rx.diagnosis}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmtDate(rx.date)} · {rx.doctorName} · {rx.medications.length}{" "}
            medication{rx.medications.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="mt-auto flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/appointments/${rx.appointmentId}`}>View</Link>
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Download className="size-4" />
          PDF
        </Button>
      </div>
    </div>
  );
}
