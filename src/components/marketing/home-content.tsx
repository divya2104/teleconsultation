"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  ClipboardCheck,
  Video,
  FileText,
  BellRing,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { DataField } from "@/components/common/data-field";
import { fadeInUp, sectionReveal, staggerContainer } from "@/lib/motion";

const STEPS = [
  {
    icon: Smartphone,
    title: "Self-test on your phone",
    body: "A distance-calibrated vision check, a short symptom questionnaire, and 2–3 guided eye photos.",
  },
  {
    icon: ClipboardCheck,
    title: "AI pre-screening runs",
    body: "Your answers are triaged for urgency and the photos screened for visible red flags — a screening aid, never a diagnosis.",
  },
  {
    icon: Video,
    title: "Meet your ophthalmologist",
    body: "The doctor opens the call with a ready-made triage summary instead of starting cold.",
  },
  {
    icon: FileText,
    title: "Get your e-prescription",
    body: "Delivered on WhatsApp, with a personalized recall date so you know exactly when to come back.",
  },
];

export function HomeContent() {
  return (
    <>
      {/* hero — above the fold, visible without JS; no entrance gating */}
      <section className="relative overflow-hidden border-b border-border-brand bg-[linear-gradient(180deg,#e6f7f9_0%,#f0fdfa_38%,var(--background)_100%)]">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-brand bg-primary-subtle px-3 py-1 font-mono text-xs font-medium text-primary-subtle-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              AI pre-screening · no hardware required
            </span>
            <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl">
              Eye care that starts before the call.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground-strong">
              Complete a guided self-test on your own phone. Your ophthalmologist
              joins with a ready-made triage summary — so the consult gets to what
              matters, faster.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 bg-cta px-6 text-cta-foreground hover:bg-cta-hover"
              >
                <Link href="/book">
                  Book a consult
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6">
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Registered ophthalmologists · Telemedicine Practice Guidelines 2020
            </p>
          </div>

          {/* product moment: the triage summary the doctor sees */}
          <div className="rounded-[--radius-lg] border border-border bg-surface p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-heading">
                  Pre-consult triage summary
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  R. Mehta · 41 · blurred vision, 4 days
                </p>
              </div>
              <TriageBadge state="review" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <DataField label="Acuity OD" value="6/12" />
              <DataField label="Acuity OS" value="6/9" />
              <DataField label="Urgency" value="2 / 3" />
            </div>
            <ul className="mt-5 space-y-1.5 text-sm text-foreground">
              <li>Photo screen: mild redness, right eye — screening aid only</li>
              <li>Questionnaire: no red-flag keywords</li>
              <li>Self-reported diabetes: yes → recall flag set</li>
            </ul>
          </div>
        </Container>
      </section>

      {/* how it works */}
      <Section>
        <Container>
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15%" }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl">
              Four steps from symptom to prescription
            </h2>
          </motion.div>

          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                variants={fadeInUp}
                className="rounded-[--radius-lg] border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-[--radius-md] bg-primary-subtle text-primary">
                    <s.icon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-heading">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </motion.li>
            ))}
          </motion.ol>
        </Container>
      </Section>

      {/* secondary USP: recall */}
      <Section className="border-y border-border bg-surface-muted py-16">
        <Container className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <span className="grid size-12 place-items-center rounded-[--radius-lg] bg-surface text-primary shadow-sm">
            <BellRing className="size-6" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-2xl">A follow-up date that's actually yours</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground-strong">
              After each consult a simple risk score — from your diagnosis and
              diabetes status — sets a personalized “come back by” reminder,
              instead of a generic annual nudge. It matters most for the millions
              at risk of diabetic retinopathy.
            </p>
          </div>
        </Container>
      </Section>

      {/* trust + doctor CTA */}
      <Section>
        <Container className="flex flex-col items-start gap-6 rounded-[--radius-xl] border border-border bg-surface p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <ShieldCheck className="size-6 shrink-0 text-primary" strokeWidth={2} />
            <div>
              <h2 className="text-xl">Are you an ophthalmologist?</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Consult on your schedule, with triage summaries that shorten every
                call. Pay-per-consult, no subscription.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="h-11 shrink-0 px-6">
            <Link href="/for-doctors">
              Practise with us
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
