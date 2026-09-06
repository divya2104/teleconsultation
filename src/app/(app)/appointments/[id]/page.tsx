import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { StatusPill } from "@/components/common/status-pill";
import { DataField } from "@/components/common/data-field";
import {
  appointments,
  prescriptions,
  recalls,
  fmtDate,
  fmtDateTime,
} from "@/lib/mock/patient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = appointments.find((a) => a.id === id);
  return { title: appt ? `Consult with ${appt.doctorName}` : "Appointment" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = appointments.find((a) => a.id === id);
  if (!appt) notFound();

  const rx = prescriptions.find((p) => p.appointmentId === appt.id);
  const recall = recalls.find((r) => r.fromAppointmentId === appt.id);
  const joinable = appt.status === "upcoming" || appt.status === "live";
  const cancellable = appt.status === "upcoming";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard?tab=appointments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading"
      >
        <ArrowLeft className="size-4" />
        All appointments
      </Link>

      {/* header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-heading">
              {appt.doctorName}
            </h1>
            <StatusPill status={appt.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {appt.doctorSpecialty} · {fmtDateTime(appt.start)}
          </p>
          <p className="mt-1 text-sm text-foreground">{appt.reason}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {joinable ? (
            <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
              <Link href={`/consult/${appt.id}`}>
                <Video className="size-4" />
                Join
              </Link>
            </Button>
          ) : null}
          {cancellable ? (
            <>
              <Button variant="outline">Reschedule</Button>
              <Button variant="destructive">Cancel</Button>
            </>
          ) : null}
        </div>
      </div>

      {/* triage summary — patient-safe */}
      <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-heading">
            Your triage summary
          </h2>
          <TriageBadge state={appt.triage} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          A screening measure to help your doctor prepare — not a diagnosis.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DataField label="Vision — right" value="6/12" />
          <DataField label="Vision — left" value="6/9" />
          <DataField label="Self-test" value={appt.intakeComplete ? "Complete" : "Pending"} />
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground-strong">
          <li>Reported: {appt.reason.toLowerCase()}</li>
          <li>No emergency red-flag phrases detected</li>
        </ul>
      </section>

      {/* prescription */}
      <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-heading">
            Prescription
          </h2>
          {rx ? (
            <Button variant="ghost" size="sm">
              <FileText className="size-4" />
              Download PDF
            </Button>
          ) : null}
        </div>
        {rx ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm">
              <span className="text-muted-foreground">Diagnosis: </span>
              <span className="font-medium text-heading">{rx.diagnosis}</span>
            </p>
            <ul className="divide-y divide-border rounded-[--radius-md] border border-border">
              {rx.medications.map((m, i) => (
                <li key={i} className="p-3">
                  <p className="text-sm font-medium text-heading">{m.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {m.dose} · {m.instructions}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground-strong">{rx.advice}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Available after your consultation. It will also arrive on WhatsApp.
          </p>
        )}
      </section>

      {/* recall */}
      {recall ? (
        <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <h2 className="font-heading text-base font-semibold text-heading">
            Recall reminder
          </h2>
          <p className="mt-2 text-sm text-muted-foreground-strong">
            {recall.reason} — come back by{" "}
            <span className="font-mono tabular-nums text-foreground">
              {fmtDate(recall.dueDate)}
            </span>
            .
          </p>
          <Button
            asChild
            size="sm"
            className="mt-4 bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            <Link href="/book">Book follow-up</Link>
          </Button>
        </section>
      ) : null}
    </div>
  );
}
