"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, ClipboardList, Target } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { band, gaugePos } from "@/components/intake/score-gauge";
import { isSkipped, summary, type EyeOrSkipped } from "@/lib/acuity";
import { readDraft } from "@/lib/intake-store";
import { sectionReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", Icon: ClipboardList, title: "Symptoms questionnaire", body: "Tell us what you've been noticing — blur, strain, floaters.", time: "~2 min" },
  { n: "02", Icon: Target, title: "Vision test, each eye", body: "Clinic-style letter chart at 3 m and 40 cm. You'll find out your exact acuity score.", time: "~6 min" },
  { n: "03", Icon: Camera, title: "Guided eye photos", body: "Structured photos so your ophthalmologist can review before the call.", time: "~2 min" },
];
const ROWS = ["E", "F P", "T O Z"];
const TICKS = ["6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
const START = "/eye-test/questionnaire";

/** Flat inner card; the section panel around them carries the lift. */
const CARD = "rounded-[var(--radius-xl)] border border-border bg-surface";
const LIFT = { boxShadow: "var(--shadow-sm)" } as const;

export function FreeEyeTestSection() {
  // Remembered result from a test done on this device (sessionStorage, never uploaded).
  const [last, setLast] = useState<{ right?: EyeOrSkipped; left?: EyeOrSkipped } | null>(null);
  useEffect(() => {
    const d = readDraft().acuity?.distance;
    if (d?.right || d?.left) setLast({ right: d.right, left: d.left });
  }, []);
  const best = [last?.right, last?.left]
    .filter((e): e is Exclude<EyeOrSkipped, { skipped: true }> => !!e && !isSkipped(e))
    .sort((a, b) => a.logMAR - b.logMAR)[0];
  const bestBand = band(best);

  return (
    // Padding carries what the old inner panel contributed, so the section keeps its height.
    <Section className="relative overflow-hidden py-14 md:py-[4.5rem] lg:py-20">
      {/* translucent illustration — full bleed behind the whole section */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/media/eye-test-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.38]"
          // Flattening the art's near-black pixels lets it sit at a higher
          // opacity and still keep text over it above 4.5:1.
          style={{ filter: "contrast(0.55) brightness(1.12)" }}
        />
        {/* white wash — never below 28 % so text over the art stays legible */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.28)_45%,rgba(255,255,255,0.42)_100%)]" />
      </div>
      <Container className="relative">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"
        >
          {/* left: pitch + steps */}
          <div>
            <h2 className="text-3xl leading-[1.08] sm:text-4xl">
              How sharp is your <span className="text-primary">vision, really?</span>
            </h2>
            <p className="mt-3 text-base text-muted-foreground-strong">
              Clinic-style letter chart · symptom check · guided eye photos
            </p>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground-strong">How it works</p>
            <ol className="mt-2.5 flex flex-col gap-2">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className={cn("flex items-start gap-3 p-3", CARD)}
                  style={LIFT}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border bg-surface-muted text-primary">
                    <s.Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-primary">{s.n}</span>
                      <span className="font-heading text-sm font-semibold text-heading">{s.title}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{s.body}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">{s.time}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-11 bg-cta px-6 text-cta-foreground hover:bg-cta-hover">
                <Link href={START}>
                  Start the free eye test
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground-strong">No account needed</span>
            </div>
            <p className="mt-3 text-xs italic text-muted-foreground-strong">
              Works with a bank card for calibration and, optionally, a second screen or a helper.
            </p>
          </div>

          {/* right: preview + gauge + triage cards */}
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground-strong">Letter chart preview</p>
                <p className="mt-1 text-sm text-muted-foreground-strong">How far can you read?</p>
              </div>
              <span className="rounded-full border border-border bg-surface/80 px-3 py-1 font-mono text-xs text-muted-foreground-strong">3 m · tumbling E</span>
            </div>

            <Link
              href={START}
              className={cn("relative block overflow-hidden px-6 pb-7 pt-5", CARD)}
              style={LIFT}
            >
              <div className="flex flex-col items-center gap-2" aria-hidden>
                {ROWS.map((r, i) => (
                  <span
                    key={r}
                    className="font-mono font-semibold tracking-[0.35em] text-heading"
                    style={{ fontSize: 38 - i * 8, lineHeight: 1, opacity: 1 - i * 0.28 }}
                  >
                    {r}
                  </span>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
              <span className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground shadow-md">
                <Target className="size-4" />
                Tap to test your vision
              </span>
            </Link>

            {/* acuity gauge */}
            <div className={cn("p-4", CARD)} style={LIFT}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-base font-semibold text-heading">
                    {best ? `You landed at ${summary(best)}` : "Your acuity score"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {last
                      ? `Right eye ${summary(last.right)} · left eye ${summary(last.left)} · from your last test on this device`
                      : "Take the test to find out where you land"}
                  </p>
                </div>
                {bestBand ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      bestBand.tone === "review" ? "bg-triage-review-bg text-triage-review-fg" : "bg-triage-normal-bg text-triage-normal-fg",
                    )}
                  >
                    {bestBand.label}
                  </span>
                ) : null}
              </div>
              <div
                className="relative mt-4 h-3 rounded-full"
                style={{ background: "linear-gradient(90deg,#c53d2f 0%,#e4903d 38%,#b9c24a 60%,#5f9c5b 80%,#2f6b45 100%)" }}
              >
                {last ? (
                  (["right", "left"] as const).map((k) => {
                    const e = last[k];
                    if (!e || isSkipped(e)) return null;
                    return (
                      <span
                        key={k}
                        className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-primary bg-surface font-mono text-[10px] font-semibold text-primary"
                        style={{ left: `${gaugePos(e.terminated === "belowRange" ? 1 : e.logMAR)}%`, boxShadow: "var(--shadow-sm)" }}
                      >
                        {k === "right" ? "R" : "L"}
                      </span>
                    );
                  })
                ) : (
                  <span
                    className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-primary bg-surface font-mono text-xs font-semibold text-primary"
                    style={{ left: "82%", boxShadow: "var(--shadow-sm)" }}
                  >
                    ?
                  </span>
                )}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                {TICKS.map((t) => <span key={t}>{t}</span>)}
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="font-semibold text-triage-urgent-fg">Poor</span>
                <span className="text-muted-foreground">{last ? "" : "Where do you land?"}</span>
                <span className="font-semibold text-triage-normal-fg">Perfect 6/6</span>
              </div>
              {last ? (
                <Link href={START} className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">
                  Retake the test
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className={cn("p-4", CARD)} style={LIFT}>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Urgency rating</p>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm font-medium">
                  <li className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-triage-normal-bg px-3 py-1.5 text-triage-normal-fg"><span className="size-2 rounded-full bg-triage-normal" />Routine</li>
                  <li className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-triage-review-bg px-3 py-1.5 text-triage-review-fg"><span className="size-2 rounded-full bg-triage-review" />Review soon</li>
                  <li className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-triage-urgent-bg px-3 py-1.5 text-triage-urgent-fg"><span className="size-2 rounded-full bg-triage-urgent" />Urgent</li>
                </ul>
              </div>
              <div className={cn("p-4", CARD)} style={LIFT}>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Red flag check</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground">
                  {["Sudden vision loss", "Light flashes", "New floaters"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5"><span className="size-2 rounded-full bg-triage-urgent/50" />{t}</li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-triage-urgent-fg">Flagged instantly</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
