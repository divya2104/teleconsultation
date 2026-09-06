import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { patients, patientHistory } from "@/lib/mock/doctor";
import { fmtDate } from "@/lib/mock/patient";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  if (!patient) notFound();
  const history = patientHistory[id] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/doctor/patients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading"
      >
        <ArrowLeft className="size-4" />
        All patients
      </Link>

      <PageHeader
        title={patient.name}
        description={`${patient.age} years · last seen ${fmtDate(patient.lastSeen)}`}
      />

      {patient.flags.length ? (
        <div className="flex flex-wrap gap-2">
          {patient.flags.map((f) => (
            <span
              key={f}
              className="rounded-full bg-triage-review-bg px-2.5 py-1 text-xs font-medium text-triage-review-fg"
            >
              {f}
            </span>
          ))}
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
          Appointment history
        </h2>
        {history.length ? (
          <ul className="divide-y divide-border overflow-hidden rounded-[--radius-lg] border border-border bg-surface">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-heading">{h.diagnosis}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {fmtDate(h.date)}
                  </p>
                </div>
                {h.prescriptionId ? (
                  <Button variant="ghost" size="sm">
                    <FileText className="size-4" />
                    Prescription
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No history on ClearSight yet.
          </p>
        )}
      </section>
    </div>
  );
}
