import { notFound } from "next/navigation";
import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { PagePlaceholder } from "@/components/common/page-placeholder";

const STEPS = ["questionnaire", "acuity", "photos", "review"] as const;
const LABELS = ["Questionnaire", "Vision check", "Photos", "Review"];

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const idx = STEPS.indexOf(step as (typeof STEPS)[number]);
  if (idx === -1) notFound();
  return (
    <FocusShell
      center={<StepProgress steps={LABELS} current={idx} />}
      exitHref="/dashboard"
    >
      <PagePlaceholder title={`Intake — ${LABELS[idx]}`} note="Guided self-test. Rule-based urgency, calibrated acuity, photo capture + DPDP consent. Step 5." />
    </FocusShell>
  );
}
