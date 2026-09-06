import Link from "next/link";
import {
  ClipboardCheck,
  CalendarRange,
  Wallet,
  ScrollText,
  BadgeCheck,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureCard } from "@/components/marketing/feature-card";
import { Faq, type FaqItem } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata = { title: "For doctors" };

const VALUE = [
  {
    icon: ClipboardCheck,
    title: "Every consult arrives pre-triaged",
    body: "Acuity result, symptom answers and photo notes are on screen before you join. Less cold-start, shorter calls.",
  },
  {
    icon: CalendarRange,
    title: "Your schedule, your slots",
    body: "Set weekly availability, block dates, change it any time. Bookings only land in windows you open.",
  },
  {
    icon: Wallet,
    title: "Pay per consult, no lock-in",
    body: "A fixed fee per completed consultation. No subscription, no minimum hours, no exclusivity.",
  },
  {
    icon: ScrollText,
    title: "Structured prescriptions",
    body: "A guided prescription form produces a clean PDF and a personalized recall date automatically.",
  },
];

const ONBOARD = [
  { step: "01", title: "Apply", body: "Name, medical registration number, specialty, and a photo ID." },
  { step: "02", title: "Credential review", body: "We verify your registration against the state medical council record." },
  { step: "03", title: "Verification", body: "A short call to confirm details and walk through the consult tools." },
  { step: "04", title: "Go live", body: "Set your availability and start accepting bookings." },
];

const FAQ: FaqItem[] = [
  {
    q: "What is the AI's role in a consultation?",
    a: "It is assistive only. Urgency scoring and photo screening produce a summary for you to review. You make every diagnosis and clinical decision, and the patient is never shown AI output as a finding.",
  },
  {
    q: "Who is liable for the consultation?",
    a: "The consulting doctor, as in any telemedicine practice under the 2020 guidelines. ClearSight provides the platform, documentation and identity verification.",
  },
  {
    q: "How are no-shows handled?",
    a: "If a patient does not join, the consult is marked no-show and the refund or reschedule policy applies. Your payout for a genuine no-show follows the same policy.",
  },
  {
    q: "What patient data can I see?",
    a: "The triage record for the current consult, plus that patient's past appointments and prescriptions on ClearSight. Access is logged.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="border-b border-border-brand bg-[linear-gradient(180deg,#eef9fb_0%,var(--background)_100%)]">
        <Container className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            For ophthalmologists
          </p>
          <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl">
            Consult on your schedule, with the context already in front of you.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground-strong">
            Patients complete a guided self-test before the call. You join with a
            triage summary instead of a blank slate. Pay-per-consult, no
            subscription.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/login?intent=practice">Apply to practise</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6">
              <a href="#onboarding">How onboarding works</a>
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Why ClearSight" title="Built to make each consult shorter and clearer" />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUE.map((v, i) => (
              <Reveal key={v.title} delay={i * 50}>
                <FeatureCard icon={v.icon} title={v.title}>
                  {v.body}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="onboarding" className="border-y border-border bg-surface-muted">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Onboarding" title="Four steps to going live" />
          </Reveal>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ONBOARD.map((o, i) => (
              <Reveal as="li" key={o.step} delay={i * 60}>
                <div className="h-full rounded-[--radius-lg] border border-border bg-surface p-5">
                  <span className="font-mono text-xs text-muted-foreground">{o.step}</span>
                  <h3 className="mt-3 font-heading text-base font-semibold text-heading">
                    {o.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{o.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Requirements" title="What you need to join" />
            <ul className="mt-5 space-y-3 text-sm text-foreground">
              <li>A current medical registration with a state medical council</li>
              <li>Ophthalmology qualification / specialty</li>
              <li>A government photo ID</li>
              <li>A device with a camera and a stable connection for video calls</li>
            </ul>
          </Reveal>
          <Reveal delay={60} id="earnings">
            <SectionHeading eyebrow="Earnings" title="How payouts work" />
            <p className="mt-5 text-sm text-muted-foreground-strong">
              A fixed fee for every completed consultation, settled to your bank
              or UPI on a regular payout cycle. Example: at ₹400 per consult, ten
              consults in a day is ₹4,000, minus platform fee. A detailed earnings
              dashboard comes after the MVP; for now you get a monthly statement.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section id="faq" className="border-t border-border">
        <Container size="prose">
          <SectionHeading eyebrow="FAQ" title="Questions doctors ask" className="mb-8" />
          <Faq items={FAQ} />
        </Container>
      </Section>

      <Section className="pt-0">
        <CtaBand
          icon={BadgeCheck}
          title="Apply to practise on ClearSight"
          body="Verification usually takes a few working days."
          ctaLabel="Apply to practise"
          ctaHref="/login?intent=practice"
        />
      </Section>
    </>
  );
}
