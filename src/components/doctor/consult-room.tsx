"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { CallStage } from "@/components/consult/call-stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TriageBadge } from "@/components/common/triage-badge";
import { DataField } from "@/components/common/data-field";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import type { TriageRecord } from "@/lib/mock/doctor";

const rxSchema = z.object({
  diagnosis: z.string().min(3, "Enter a diagnosis"),
  medications: z
    .array(
      z.object({
        name: z.string().min(2, "Medication name required"),
        dose: z.string().min(1, "Dose required"),
        instructions: z.string().min(2, "Instructions required"),
      }),
    )
    .min(1, "Add at least one medication"),
  advice: z.string().optional(),
});
type RxForm = z.infer<typeof rxSchema>;

export function ConsultRoom({
  id,
  triage,
  photoUrls,
}: {
  id: string;
  triage: TriageRecord;
  photoUrls: string[];
}) {
  const router = useRouter();
  const [issued, setIssued] = useState(false);

  const form = useForm<RxForm>({
    resolver: zodResolver(rxSchema),
    defaultValues: {
      diagnosis: "",
      medications: [{ name: "", dose: "", instructions: "" }],
      advice: "",
    },
  });
  const meds = useFieldArray({ control: form.control, name: "medications" });

  const onSubmit = (values: RxForm) => {
    // ponytail: no backend — pretend PDF + WhatsApp + recall all fired.
    console.log("prescription", values);
    setIssued(true);
    toast.success("Prescription issued — sent to the patient, recall scheduled");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* left: call + prescription */}
      <div className="flex flex-col gap-6">
        <CallStage
          mainLabel="Patient video"
          onLeave={() => router.push("/doctor/dashboard")}
        />

        {/* prescription form / wrap-up */}
        {issued ? (
          <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
            <h2 className="font-heading text-base font-semibold text-heading">
              Consult complete
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prescription delivered on WhatsApp. Recall scheduled from the
              diagnosis and the patient&apos;s diabetes status.
            </p>
            <Button
              className="mt-4 bg-cta text-cta-foreground hover:bg-cta-hover"
              onClick={() => router.push("/doctor/dashboard")}
            >
              End consult
            </Button>
          </section>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-[--radius-lg] border border-border bg-surface p-5"
          >
            <h2 className="font-heading text-base font-semibold text-heading">
              E-prescription
            </h2>

            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" {...form.register("diagnosis")} placeholder="e.g. Allergic conjunctivitis" />
              {form.formState.errors.diagnosis ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.diagnosis.message}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Label>Medications</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => meds.append({ name: "", dose: "", instructions: "" })}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {meds.fields.map((f, i) => (
                <div key={f.id} className="rounded-[--radius-md] border border-border p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Medication"
                        {...form.register(`medications.${i}.name`)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Dose" {...form.register(`medications.${i}.dose`)} />
                        <Input
                          placeholder="Instructions"
                          {...form.register(`medications.${i}.instructions`)}
                        />
                      </div>
                    </div>
                    {meds.fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => meds.remove(i)}
                        className="grid size-8 place-items-center rounded-[--radius-sm] text-muted-foreground hover:bg-surface-muted hover:text-destructive"
                        aria-label="Remove medication"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  {form.formState.errors.medications?.[i] ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.medications[i]?.name?.message ??
                        form.formState.errors.medications[i]?.dose?.message ??
                        form.formState.errors.medications[i]?.instructions?.message}
                    </p>
                  ) : null}
                </div>
              ))}
              {form.formState.errors.medications?.root ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.medications.root.message}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <Label htmlFor="advice">Advice / notes</Label>
              <Textarea
                id="advice"
                rows={3}
                {...form.register("advice")}
                placeholder="Lifestyle advice, when to return, warning signs…"
              />
            </div>

            <Button
              type="submit"
              className="mt-5 bg-cta text-cta-foreground hover:bg-cta-hover"
            >
              Generate prescription
            </Button>
          </form>
        )}
      </div>

      {/* right: triage panel */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[--radius-lg] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-heading">
                {triage.patientName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {triage.age}y · {triage.reason}
              </p>
            </div>
            <TriageBadge
              state={(["normal", "review", "review", "urgent"] as const)[triage.urgency]}
            />
          </div>

          {triage.redFlags.length ? (
            <EmergencyBanner className="mt-4">
              Self-test flagged: {triage.redFlags.join(", ")}.
            </EmergencyBanner>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <DataField label="Acuity OD" value={triage.acuity.right} />
            <DataField label="Acuity OS" value={triage.acuity.left} />
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Questionnaire
          </h3>
          <dl className="mt-2 space-y-1.5 text-sm">
            {triage.questionnaire.map((row, i) => (
              <div key={i}>
                <dt className="text-muted-foreground">{row.q}</dt>
                <dd className="text-foreground">{row.a}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Photo screen — aid only
          </h3>
          <div className="mt-2 flex gap-2">
            {(photoUrls.length ? photoUrls : [null, null, null]).map((u, i) =>
              u ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={u}
                  alt={`Eye photo ${i + 1}`}
                  className="size-16 rounded-[--radius-sm] border border-border object-cover"
                />
              ) : (
                <div
                  key={i}
                  className="grid size-16 place-items-center rounded-[--radius-sm] border border-border bg-surface-muted text-muted-foreground"
                >
                  <ImageIcon className="size-5" strokeWidth={1.5} />
                </div>
              ),
            )}
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground-strong">
            {triage.photoNotes.map((n, i) => (
              <li key={i}>· {n}</li>
            ))}
          </ul>

          {triage.pastAppointments.length ? (
            <>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Past appointments
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {triage.pastAppointments.map((a, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{a.date}</span>
                    <span className="text-right">{a.diagnosis}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
