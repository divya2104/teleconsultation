"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { sectionReveal } from "@/lib/motion";

export function HomeContent() {
  return (
    <>
      {/* hero — text left / media right; above the fold, visible without JS */}
      <section className="relative overflow-hidden border-b border-border-brand bg-[linear-gradient(180deg,#e6f7f9_0%,#f0fdfa_38%,var(--background)_100%)]">
        <Container className="grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
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

          {/* media panel — placeholder; real image goes at public/media/hero.jpg */}
          <div
            style={{ boxShadow: "var(--shadow-lg)" }}
            className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border-brand bg-surface-muted sm:aspect-square"
          >
            <span className="absolute inset-0 grid place-items-center text-muted-foreground">
              <ImageIcon className="size-8" strokeWidth={1.5} aria-hidden />
            </span>
            <Image
              src="/media/hero.jpg"
              alt="A patient during an eye-care video consultation"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </Container>
      </section>

      {/* how it works */}
      <Section className="border-y border-border bg-[#eef8f5]">
        <Container>
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15%" }}
            className="text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
              How it works
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl">
              Four steps from symptom to prescription
            </h2>
          </motion.div>

          {/* process diagram — real image at public/media/how-it-works.png (2652×948) */}
          <div
            style={{ boxShadow: "var(--shadow-lg)" }}
            className="relative mt-10 aspect-[14/5] overflow-hidden rounded-[var(--radius-xl)] border border-border-brand bg-surface"
          >
            <span className="absolute inset-0 grid place-items-center text-muted-foreground">
              <ImageIcon className="size-8" strokeWidth={1.5} aria-hidden />
            </span>
            <Image
              src="/media/how-it-works.png"
              alt="The ClearSight process: self-test on your phone, AI pre-screening, a video consultation with an ophthalmologist, then an e-prescription with a personalized recall date"
              fill
              sizes="(min-width: 1024px) 1000px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* testimonials (ported from Figma) */}
      <TestimonialsSection />
    </>
  );
}
