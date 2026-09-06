import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Faq, type FaqItem } from "@/components/marketing/faq";

export const metadata = { title: "Pricing" };

const INCLUDED = [
  "Guided self-test — vision check, symptom questionnaire, eye photos",
  "AI pre-screening and triage summary for your doctor",
  "Video consultation with a registered ophthalmologist",
  "Structured e-prescription (PDF) on WhatsApp",
  "Personalized recall reminder",
];

const FAQ: FaqItem[] = [
  {
    q: "Is there a subscription?",
    a: "No. You pay once per consultation. Subscription plans may come later, but the MVP is pay-per-visit only.",
  },
  {
    q: "What happens if my payment fails?",
    a: "Your chosen slot is held briefly while you retry. If payment doesn't complete, the slot is released so someone else can book it.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, under the refund policy — for example if the doctor is a no-show or the consult can't proceed. Patient no-shows and late cancellations follow the stated windows.",
  },
  {
    q: "Is a follow-up free?",
    a: "A follow-up is a separate consultation at the same per-visit price. Your recall reminder tells you when one is due.",
  },
  {
    q: "How do I pay?",
    a: "Through Razorpay — UPI, cards, netbanking and wallets are supported.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="border-b border-border-brand bg-[linear-gradient(180deg,#eef9fb_0%,var(--background)_100%)]">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Pay per consultation. No subscription."
            lead="One transparent price covers the whole flow — from the self-test to the prescription and your recall reminder."
            align="center"
          />
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="prose">
          <div className="-mt-10 rounded-[--radius-xl] border border-border bg-surface p-8 shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
              Per consultation
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-bold tracking-[-0.02em] text-heading tabular-nums">
                ₹499
              </span>
              <span className="text-sm text-muted-foreground">incl. taxes</span>
            </div>
            <ul className="mt-6 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-triage-normal" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-7 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            >
              <Link href="/book">
                Book a consult
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
              Paid securely via Razorpay · UPI supported
            </p>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border bg-surface-muted">
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Good to know" title="What a consult doesn't include" />
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground-strong">
              <li>Follow-up consultations are booked and paid separately.</li>
              <li>Medicines and eyeglass frames are not sold through ClearSight.</li>
              <li>In-person examinations and procedures are outside the platform.</li>
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Policy" title="Refunds & no-shows" />
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground-strong">
              <li>Payment failure holds your slot briefly, then releases it.</li>
              <li>Full refund if the doctor is unavailable or the consult can&apos;t proceed.</li>
              <li>Cancellations follow the windows shown at booking; late cancellations and no-shows may not be refundable.</li>
              <li>Approved refunds return to the original payment method via Razorpay.</li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="prose">
          <SectionHeading eyebrow="FAQ" title="Pricing & cancellations" className="mb-8" />
          <Faq items={FAQ} />
        </Container>
      </Section>
    </>
  );
}
