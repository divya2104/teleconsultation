import Link from "next/link";
import { Video, FileText, CalendarClock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { StatusPill } from "@/components/common/status-pill";
import {
  type Appointment,
  type Prescription,
  type Recall,
  fmtDate,
  fmtDateTime,
} from "@/lib/mock/patient";

export function AppointmentCard({
  appt,
  featured = false,
}: {
  appt: Appointment;
  featured?: boolean;
}) {
  const joinable = appt.status === "upcoming" || appt.status === "live";
  return (
    <div className="rounded-[--radius-lg] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 place-items-center rounded-[--radius-md] bg-surface-muted text-muted-foreground">
            <Stethoscope className="size-[18px]" strokeWidth={2} />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-heading">
              {appt.doctorName}
            </p>
            <p className="text-xs text-muted-foreground">{appt.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TriageBadge state={appt.triage} />
          <StatusPill status={appt.status} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm tabular-nums text-foreground">
          {fmtDateTime(appt.start)}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/appointments/${appt.id}`}>Details</Link>
          </Button>
          {featured && joinable ? (
            <Button asChild size="sm" className="bg-cta text-cta-foreground hover:bg-cta-hover">
              <Link href={`/consult/${appt.id}`}>
                <Video className="size-4" />
                Join
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {featured && !appt.intakeComplete ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[--radius-md] bg-triage-review-bg px-3 py-2.5">
          <p className="text-xs font-medium text-triage-review-fg">
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
  );
}

export function PrescriptionCard({ rx }: { rx: Prescription }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[--radius-lg] border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-[--radius-md] bg-surface-muted text-muted-foreground">
          <FileText className="size-[18px]" strokeWidth={2} />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold text-heading">
            {rx.diagnosis}
          </p>
          <p className="text-xs text-muted-foreground">
            {fmtDate(rx.date)} · {rx.doctorName} · {rx.medications.length} medication
            {rx.medications.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/appointments/${rx.appointmentId}`}>View</Link>
        </Button>
        <Button variant="ghost" size="sm">
          Download PDF
        </Button>
      </div>
    </div>
  );
}

export function RecallCard({ recall }: { recall: Recall }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[--radius-lg] border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-[--radius-md] bg-primary-subtle text-primary">
          <CalendarClock className="size-[18px]" strokeWidth={2} />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold text-heading">
            {recall.reason}
          </p>
          <p className="text-xs text-muted-foreground">
            Due by{" "}
            <span className="font-mono tabular-nums">{fmtDate(recall.dueDate)}</span>
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="bg-cta text-cta-foreground hover:bg-cta-hover">
        <Link href="/book">Book follow-up</Link>
      </Button>
    </div>
  );
}
