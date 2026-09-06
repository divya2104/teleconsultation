import Link from "next/link";
import {
  Ruler,
  ListChecks,
  Camera,
  ShieldAlert,
  Video,
  FileText,
  CalendarClock,
  ScrollText,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata = { title: "How it works" };

const INTAKE = [
  {
    icon: Ruler,
    title: "Calibrated vision check",
    body: "A short on-screen eye chart. You calibrate the viewing distance first, then test one eye at a time. Deterministic — not AI — and the part patients trust most.",
  },
  {
    icon: ListChecks,
    title: "Symptom questionnaire",
    body: "A few guided questions. Answers are scored for urgency using fixed rules; red-flag phrases (like sudden vision loss) trigger an immediate advisory.",
  },
  {
    icon: Camera,
    title: "2–3 guided eye photos",
    body: "An on-screen frame guides each shot. You give explicit consent for photo and health data first, and can retake any image.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="border-b border-border-brand bg-[linear-gradient(180deg,#eef9fb_0%,var(--background)_100%)]">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From symptom to prescription, in one guided flow"
            lead="You do a five-minute self-test on your own phone. Your ophthalmologist joins the call already holding a triage summary — so the consult gets to what matters."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-11 bg-cta px-6 text-cta-foreground hover:bg-cta-hover">
              <Link href="/book">Book a consult</Link>
            </Button>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <a href="#intake" className="hover:text-heading">1 · Intake</a>
              <a href="#screening" className="hover:text-heading">2 · Pre-screening</a>
              <a href="#consult" className="hover:text-heading">3 · Consult</a>
              <a href="#recall" className="hover:text-heading">4 · Prescription &amp; recall</a>
            </nav>
          </div>
        </Container>
      </Section>

      <Section id="intake">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Step 1"
              title="Guided intake on your phone"
              lead="No app to install, no hardware. Three parts, about five minutes."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {INTAKE.map((it, i) => (
              <Reveal key={it.title} delay={i * 60}>
                <FeatureCard icon={it.icon} title={it.title}>
                  {it.body}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="screening" className="border-y border-border bg-surface-muted">
        <Container className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <span className="grid size-12 place-items-center rounded-[--radius-lg] bg-surface text-primary shadow-sm">
            <ShieldAlert className="size-6" strokeWidth={2} />
          </span>
          <div>
            <SectionHeading
              eyebrow="Step 2"
              title="AI pre-screening and triage"
              lead="A screening aid — never a diagnosis. The doctor makes every clinical call."
            />
            <ul className="mt-5 space-y-3 text-sm text-foreground">
              <li><strong className="font-medium text-heading">Urgency scoring.</strong> Rule-based, from your questionnaire. Red-flag keywords surface an emergency advisory and bypass normal queue routing.</li>
              <li><strong className="font-medium text-heading">Photo red-flag check.</strong> A lightweight vision model looks for gross signs — redness, cloudiness, lid abnormality. Results go to the doctor, never to you as a finding.</li>
              <li><strong className="font-medium text-heading">Inconclusive is fine.</strong> If screening can&apos;t say, it&apos;s flagged for the doctor and never blocks your booking.</li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section id="consult">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Step 3"
              title="Meet your ophthalmologist"
              lead="A video consultation with a registered doctor who already has your triage summary."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Reveal>
              <FeatureCard icon={Video} title="A consult that starts warm">
                No repeating your history from scratch. The doctor opens with your
                acuity result, symptoms and photo notes on screen.
              </FeatureCard>
            </Reveal>
            <Reveal delay={60}>
              <FeatureCard icon={FileText} title="If the connection drops">
                The call falls back to audio-only, or you&apos;re moved into a
                reschedule flow. You&apos;re never left stuck.
              </FeatureCard>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="recall" className="border-y border-border bg-surface-muted">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Step 4"
              title="E-prescription and a recall date that's yours"
              lead="Delivered on WhatsApp, with SMS and email as backup."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Reveal>
              <FeatureCard icon={ScrollText} title="Structured e-prescription">
                Diagnosis, medication and advice in a clear format, as a
                downloadable PDF.
              </FeatureCard>
            </Reveal>
            <Reveal delay={60}>
              <FeatureCard icon={CalendarClock} title="Personalized recall">
                A simple risk score — from your diagnosis and diabetes status —
                sets a specific &ldquo;come back by&rdquo; date instead of a
                generic annual nudge.
              </FeatureCard>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="prose" className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Safety &amp; regulation
          </p>
          <p className="mt-3 text-muted-foreground-strong">
            ClearSight follows India&apos;s Telemedicine Practice Guidelines
            (2020): consultations only with registered doctors, proper
            documentation, and AI that is assistive only and never presented as a
            diagnosis. Health data is encrypted in transit and at rest, with
            DPDP-aligned consent and the right to delete your data.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <CtaBand
          title="Ready when you are"
          body="Book a consult and start the guided self-test — about five minutes."
          ctaLabel="Book a consult"
          ctaHref="/book"
          variant="cta"
        />
      </Section>
    </>
  );
}
