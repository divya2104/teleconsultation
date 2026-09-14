import { notFound } from "next/navigation";
import { FocusShell } from "@/components/layout/focus-shell";
import { StepProgress } from "@/components/common/step-progress";
import { Questionnaire } from "@/components/intake/questionnaire";
import { Acuity } from "@/components/intake/acuity";
import { Photos } from "@/components/intake/photos";
import { Review } from "@/components/intake/review";
import { INTAKE_STEPS, STEP_LABELS, type IntakeStep } from "@/lib/mock/intake";

export const metadata = { title: "Free eye test" };

const BODY: Record<IntakeStep, React.ComponentType> = {
  questionnaire: Questionnaire,
  acuity: Acuity,
  photos: Photos,
  review: Review,
};

/**
 * Public, no booking: the same four intake steps. The review step ends in a
 * triage card with "Book a consultation"; the draft is attached to the
 * appointment after payment (see PaymentSuccess), so the patient is not asked
 * to repeat the test.
 */
export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const idx = INTAKE_STEPS.indexOf(step as IntakeStep);
  if (idx === -1) notFound();
  const Body = BODY[step as IntakeStep];
  return (
    <FocusShell center={<StepProgress steps={STEP_LABELS} current={idx} />} exitHref="/" exitLabel="Exit" containerSize="wide">
      <Body />
    </FocusShell>
  );
}
