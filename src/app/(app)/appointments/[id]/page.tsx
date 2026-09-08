import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { StatusPill } from "@/components/common/status-pill";
import { DataField } from "@/components/common/data-field";
import { fmtDateTime } from "@/lib/mock/patient";
import { getAppointment, getTriageForConsult } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = await getAppointment(id);
  return { title: appt ? `Consult with ${appt.doctorName}` : "Appointment" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = await getAppointment(id);
  if (!appt) notFound();

  const triage = appt.intakeComplete ? await getTriageForConsult(id) : null;
  const rec = triage?.record;
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
          <DataField
            label="Vision — right"
            value={rec?.acuity.right ?? "—"}
          />
          <DataField label="Vision — left" value={rec?.acuity.left ?? "—"} />
          <DataField
            label="Self-test"
            value={appt.intakeComplete ? "Complete" : "Pending"}
          />
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground-strong">
          <li>Reported: {appt.reason.toLowerCase() || "—"}</li>
          <li>
            {rec && rec.redFlags.length
              ? `Flagged: ${rec.redFlags.join(", ")}`
              : "No emergency red-flag phrases detected"}
          </li>
        </ul>
      </section>

      {/* TODO(mock): e-prescriptions are a backend follow-up */}
      <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
        <h2 className="font-heading text-base font-semibold text-heading">
          Prescription
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Available after your consultation. It will also arrive on WhatsApp.
        </p>
      </section>
    </div>
  );
}
