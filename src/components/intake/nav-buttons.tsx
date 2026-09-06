"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTAKE_STEPS, type IntakeStep } from "@/lib/mock/intake";

export function NavButtons({
  step,
  canContinue = true,
  continueLabel = "Continue",
  onContinue,
}: {
  step: IntakeStep;
  canContinue?: boolean;
  continueLabel?: string;
  onContinue?: () => void | boolean;
}) {
  const router = useRouter();
  const i = INTAKE_STEPS.indexOf(step);
  const prev = i > 0 ? INTAKE_STEPS[i - 1] : null;
  const nextStep = i < INTAKE_STEPS.length - 1 ? INTAKE_STEPS[i + 1] : null;

  const go = () => {
    if (onContinue) {
      const ok = onContinue();
      if (ok === false) return;
    }
    if (nextStep) router.push(`/intake/${nextStep}`);
  };

  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
      <Button
        variant="ghost"
        onClick={() => (prev ? router.push(`/intake/${prev}`) : router.push("/book"))}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <Button
        onClick={go}
        disabled={!canContinue}
        className="bg-cta text-cta-foreground hover:bg-cta-hover"
      >
        {continueLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
