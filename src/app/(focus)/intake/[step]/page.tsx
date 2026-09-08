import { notFound } from "next/navigation";
import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { Questionnaire } from "@/components/intake/questionnaire";
import { Acuity } from "@/components/intake/acuity";
import { Photos } from "@/components/intake/photos";
import { Review } from "@/components/intake/review";
import { INTAKE_STEPS, STEP_LABELS, type IntakeStep } from "@/lib/mock/intake";

// Auth-gated, keyed on ?appt= — always rendered per request.
export const dynamic = "force-dynamic";

const BODY: Record<IntakeStep, React.ComponentType> = {
  questionnaire: Questionnaire,
  acuity: Acuity,
  photos: Photos,
  review: Review,
};

export default async function Page({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const idx = INTAKE_STEPS.indexOf(step as IntakeStep);
  if (idx === -1) notFound();
  const Body = BODY[step as IntakeStep];

  return (
    <FocusShell
      center={<StepProgress steps={STEP_LABELS} current={idx} />}
      exitHref="/dashboard"
      containerSize="wide"
    >
      <Body />
    </FocusShell>
  );
}
