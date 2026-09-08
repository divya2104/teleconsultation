"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

/* ─── Tiny hook: reveal once the element scrolls into view ─
   Scroll listener (not IntersectionObserver) + a timed backstop, so
   content is never left stuck hidden in embeds/browsers that don't
   deliver scroll/intersection notifications. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inView = () => el.getBoundingClientRect().top < window.innerHeight * 0.88;
    if (inView()) {
      setVisible(true);
      return;
    }
    const onScroll = () => {
      if (inView()) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const backstop = window.setTimeout(() => setVisible(true), 1200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(backstop);
    };
  }, []);
  return { ref, visible };
}

/* ─── Spot illustrations (inline SVG, 2-tone teal + sand) ─ */
function IllusPhone() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="80" cy="80" r="72" fill="var(--illus-secondary)" />
      {/* phone body */}
      <rect x="52" y="30" width="56" height="96" rx="10" fill="white" stroke="var(--illus-primary)" strokeWidth="3" />
      {/* screen */}
      <rect x="58" y="44" width="44" height="64" rx="5" fill="var(--teal-50)" />
      {/* eye chart rows */}
      <text x="80" y="60" textAnchor="middle" fontSize="12" fontFamily="DM Mono, monospace" fill="var(--illus-primary)" fontWeight="500">E</text>
      <text x="80" y="73" textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="var(--teal-600)">F P</text>
      <text x="80" y="84" textAnchor="middle" fontSize="7" fontFamily="DM Mono, monospace" fill="var(--teal-600)">T O Z</text>
      <text x="80" y="94" textAnchor="middle" fontSize="5.5" fontFamily="DM Mono, monospace" fill="var(--muted-text)">L P E D</text>
      {/* calibration line */}
      <line x1="62" y1="102" x2="98" y2="102" stroke="var(--teal-300)" strokeWidth="1.5" strokeDasharray="3,2" />
      {/* home indicator */}
      <rect x="72" y="116" width="16" height="3" rx="2" fill="var(--teal-200)" />
      {/* tick mark */}
      <circle cx="106" cy="52" r="10" fill="var(--green-light)" />
      <polyline points="101,52 105,56 112,48" stroke="var(--green-cta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IllusAI() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="80" cy="80" r="72" fill="var(--illus-secondary)" />
      {/* brain / circuit */}
      <circle cx="80" cy="72" r="28" fill="white" stroke="var(--illus-primary)" strokeWidth="2.5" />
      {/* circuit nodes */}
      <circle cx="80" cy="72" r="6" fill="var(--illus-primary)" />
      <line x1="80" y1="66" x2="80" y2="52" stroke="var(--teal-300)" strokeWidth="1.5" />
      <line x1="86" y1="72" x2="100" y2="72" stroke="var(--teal-300)" strokeWidth="1.5" />
      <line x1="74" y1="72" x2="60" y2="72" stroke="var(--teal-300)" strokeWidth="1.5" />
      <line x1="84" y1="76" x2="92" y2="84" stroke="var(--teal-300)" strokeWidth="1.5" />
      <line x1="76" y1="76" x2="68" y2="84" stroke="var(--teal-300)" strokeWidth="1.5" />
      {/* end nodes */}
      <circle cx="80" cy="50" r="4" fill="var(--teal-400)" />
      <circle cx="101" cy="72" r="4" fill="var(--teal-400)" />
      <circle cx="59" cy="72" r="4" fill="var(--teal-400)" />
      <circle cx="93" cy="85" r="4" fill="var(--teal-400)" />
      <circle cx="67" cy="85" r="4" fill="var(--teal-400)" />
      {/* flag */}
      <rect x="28" y="104" width="104" height="24" rx="7" fill="var(--green-light)" stroke="var(--green-cta)" strokeWidth="1.5" />
      <text x="80" y="120" textAnchor="middle" fontSize="8.5" fontFamily="Inter,sans-serif" fill="var(--green-cta)" fontWeight="600">Screening aid only</text>
    </svg>
  );
}

function IllusDoctor() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="80" cy="80" r="72" fill="var(--illus-secondary)" />
      {/* laptop / video call screen */}
      <rect x="34" y="50" width="92" height="62" rx="8" fill="white" stroke="var(--illus-primary)" strokeWidth="2.5" />
      <rect x="34" y="98" width="92" height="14" rx="0" fill="var(--teal-50)" stroke="var(--illus-primary)" strokeWidth="2.5" />
      <rect x="60" y="108" width="40" height="4" rx="2" fill="var(--teal-200)" />
      {/* face inside screen */}
      <circle cx="80" cy="76" r="14" fill="var(--teal-100)" />
      <circle cx="80" cy="70" r="7" fill="var(--teal-300)" />
      <path d="M68 82 Q80 92 92 82" stroke="var(--teal-600)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* stethoscope hint */}
      <path d="M42 62 Q38 68 42 74" stroke="var(--illus-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="76" r="3" fill="var(--teal-400)" />
      {/* call indicator */}
      <circle cx="112" cy="58" r="6" fill="#dcfce7" />
      <circle cx="112" cy="58" r="3" fill="var(--green-cta)" />
    </svg>
  );
}

function IllusPrescription() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="80" cy="80" r="72" fill="var(--illus-secondary)" />
      {/* doc */}
      <rect x="48" y="32" width="64" height="84" rx="8" fill="white" stroke="var(--illus-primary)" strokeWidth="2.5" />
      <rect x="58" y="48" width="44" height="5" rx="2.5" fill="var(--teal-200)" />
      <rect x="58" y="60" width="36" height="4" rx="2" fill="var(--teal-100)" />
      <rect x="58" y="70" width="40" height="4" rx="2" fill="var(--teal-100)" />
      <rect x="58" y="80" width="32" height="4" rx="2" fill="var(--teal-100)" />
      <rect x="58" y="90" width="38" height="4" rx="2" fill="var(--teal-100)" />
      {/* Rx symbol */}
      <text x="80" y="42" textAnchor="middle" fontSize="11" fontFamily="Outfit, sans-serif" fill="var(--illus-primary)" fontWeight="700">Rx</text>
      {/* calendar badge */}
      <rect x="88" y="96" width="36" height="30" rx="6" fill="var(--green-light)" stroke="var(--green-cta)" strokeWidth="1.5" />
      <rect x="88" y="96" width="36" height="10" rx="6" fill="var(--green-cta)" />
      <rect x="88" y="101" width="36" height="5" rx="0" fill="var(--green-cta)" />
      <text x="106" y="119" textAnchor="middle" fontSize="8" fontFamily="DM Mono,monospace" fill="var(--green-cta)" fontWeight="500">recall</text>
      {/* WhatsApp-ish arrow */}
      <circle cx="46" cy="114" r="10" fill="var(--teal-100)" />
      <path d="M42 114 l5 -5 0 3 6 0 0 4 -6 0 0 3z" fill="var(--teal-500)" />
    </svg>
  );
}

/* ─── Step chip ─────────────────────────────────────────── */
function StepChip({ n }: { n: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase"
      style={{ fontFamily: "'DM Mono', monospace", background: "var(--teal-100)", color: "var(--teal-700)" }}
    >
      <span
        className="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-semibold"
        style={{ background: "var(--teal-500)", fontFamily: "'DM Mono', monospace" }}
      >
        {n}
      </span>
      Step {n}
    </span>
  );
}

/* ─── Feature card ──────────────────────────────────────── */
interface CardProps {
  icon: ReactNode;
  title: string;
  body: string;
  delay?: string;
}
function FeatureCard({ icon, title, body, delay = "" }: CardProps) {
  return (
    <div
      className={`flex flex-col gap-4 p-7 rounded-[20px] h-full anim-section ${delay}`}
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-2xl" style={{ background: "var(--teal-100)" }}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: "var(--navy)" }}>{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>{body}</p>
      </div>
    </div>
  );
}

/* ─── Text-point item ───────────────────────────────────── */
function TextPoint({ label, body, delay = "" }: { label: string; body: string; delay?: string }) {
  return (
    <div className={`flex gap-4 anim-section ${delay}`}>
      <div className="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ background: "var(--teal-100)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--body-text)" }}>
        <strong className="font-semibold" style={{ color: "var(--navy)" }}>{label} </strong>
        {body}
      </p>
    </div>
  );
}

/* ─── Section header (step + heading + sub) ─────────────── */
interface SectionHeaderProps {
  step: string;
  heading: string;
  sub: string;
  light?: boolean;
}
function SectionHeader({ step, heading, sub, light }: SectionHeaderProps) {
  return (
    <div className="mb-10 anim-section">
      <StepChip n={step} />
      <h2
        className="mt-4 mb-3 text-4xl font-extrabold leading-tight"
        style={{ fontFamily: "'Outfit', sans-serif", color: light ? "var(--navy)" : "var(--navy)" }}
      >
        {heading}
      </h2>
      <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--muted-text)" }}>{sub}</p>
    </div>
  );
}

/* ─── Stepper progress rail ─────────────────────────────── */
const STEPS = [
  { n: "1", label: "Intake", id: "step1" },
  { n: "2", label: "Pre-screening", id: "step2" },
  { n: "3", label: "Consult", id: "step3" },
  { n: "4", label: "Prescription & recall", id: "step4" },
];

function StepperRail({ active }: { active: number }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="flex items-center gap-0 flex-wrap gap-y-3 mt-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <button
            onClick={() => scrollTo(s.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
            style={{
              background: active === i ? "var(--teal-100)" : "transparent",
              color: active === i ? "var(--teal-700)" : "var(--muted-text)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.75rem",
              fontWeight: active === i ? "600" : "400",
              border: active === i ? "1.5px solid var(--teal-300)" : "1.5px solid transparent",
            }}
          >
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active === i ? "var(--teal-500)" : "var(--teal-200)",
                color: active === i ? "white" : "var(--teal-700)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {s.n}
            </span>
            {s.label}
          </button>
          {i < STEPS.length - 1 && (
            <span className="mx-1 text-xs" style={{ color: "var(--teal-300)", fontFamily: "'DM Mono', monospace" }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Inline SVG icons (teal, 20px) ────────────────────── */
const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconList = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconRefresh = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

/* ─── Blob background shape ─────────────────────────────── */
function BlobAccent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={`absolute pointer-events-none select-none ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M200,40 C280,40 350,110 350,200 C350,290 280,360 200,360 C120,360 50,290 50,200 C50,110 120,40 200,40Z"
        fill="var(--teal-100)"
        opacity="0.45"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Page Component
══════════════════════════════════════════════════════════ */
export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Update active stepper based on scroll position
  useEffect(() => {
    const ids = ["step1", "step2", "step3", "step4"];
    const onScroll = () => {
      let current = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = i;
        }
      });
      setActiveStep(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hero = useReveal();
  const s1 = useReveal();
  const s2 = useReveal();
  const s3 = useReveal();
  const s4 = useReveal();
  const safety = useReveal();
  const cta = useReveal();

  return (
    <div className="hiw-scope" style={{ background: "var(--mint-bg)", minHeight: "100vh", overflowX: "hidden" }}>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        ref={hero.ref}
        className="relative overflow-hidden"
        style={{ background: "var(--mint-bg)", paddingTop: "80px", paddingBottom: "80px" }}
      >
        <BlobAccent className="w-96 h-96 -top-24 -right-24 opacity-60" />
        <BlobAccent className="w-64 h-64 bottom-0 left-10 opacity-30" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          {/* Eyebrow */}
          <div className={`transition-all duration-700 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span
              className="inline-block text-xs font-medium tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: "'DM Mono', monospace", color: "var(--teal-600)" }}
            >
              How It Works
            </span>
          </div>

          <div className={`transition-all duration-700 delay-100 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h1
              className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 max-w-3xl"
              style={{ fontFamily: "'Outfit', sans-serif", color: "var(--navy)" }}
            >
              From symptom to prescription,{" "}
              <span style={{ color: "var(--teal-600)" }}>in one guided flow</span>
            </h1>
          </div>

          <div className={`transition-all duration-700 delay-200 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-lg leading-relaxed max-w-2xl mb-8" style={{ color: "var(--body-text)" }}>
              You do a five-minute self-test on your own phone. Your ophthalmologist joins
              the call already holding a triage summary — so the consult gets to what matters.
            </p>
          </div>

          <div className={`transition-all duration-700 delay-300 ${hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-white text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                style={{ background: "var(--green-cta)", fontFamily: "'Outfit', sans-serif", boxShadow: "0 8px 24px rgba(58,125,85,0.3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--green-cta-hov)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--green-cta)")}
              >
                Book a consult
              </Link>
              <StepperRail active={activeStep} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 1 ────────────────────────────────────────── */}
      <section id="step1" ref={s1.ref} style={{ background: "white", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Illustration */}
            <div className={`transition-all duration-700 ${s1.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="w-full max-w-xs mx-auto lg:mx-0">
                <IllusPhone />
              </div>
            </div>
            {/* Content */}
            <div className={`transition-all duration-700 delay-150 ${s1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <SectionHeader
                step="1"
                heading="Guided intake on your phone"
                sub="No app to install, no hardware. Three parts, about five minutes."
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <FeatureCard
                  icon={<IconEye />}
                  title="Calibrated vision check"
                  body="A short on-screen eye chart. You calibrate the viewing distance first, then test one eye at a time. Deterministic — not AI — and the part patients trust most."
                  delay="anim-delay-1"
                />
                <FeatureCard
                  icon={<IconList />}
                  title="Symptom questionnaire"
                  body="A few guided questions. Answers are scored for urgency using fixed rules; red-flag phrases (like sudden vision loss) trigger an immediate advisory."
                  delay="anim-delay-2"
                />
                <FeatureCard
                  icon={<IconCamera />}
                  title="2–3 guided eye photos"
                  body="An on-screen frame guides each shot. You give explicit consent for photo and health data first, and can retake any image."
                  delay="anim-delay-3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 2 ────────────────────────────────────────── */}
      <section
        id="step2"
        ref={s2.ref}
        style={{ background: "var(--mint-alt)", paddingTop: "80px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}
      >
        <BlobAccent className="w-80 h-80 -bottom-20 -left-20 opacity-50" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Content */}
            <div className={`transition-all duration-700 ${s2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <SectionHeader
                step="2"
                heading="AI pre-screening and triage"
                sub="A screening aid — never a diagnosis. The doctor makes every clinical call."
                light
              />
              <div className="flex flex-col gap-5 mt-2">
                <TextPoint
                  label="Urgency scoring."
                  body="Rule-based, from your questionnaire. Red-flag keywords surface an emergency advisory and bypass normal queue routing."
                  delay="anim-delay-1"
                />
                <TextPoint
                  label="Photo red-flag check."
                  body="A lightweight vision model looks for gross signs — redness, cloudiness, lid abnormality. Results go to the doctor, never to you as a finding."
                  delay="anim-delay-2"
                />
                <TextPoint
                  label="Inconclusive is fine."
                  body="If screening can't say, it's flagged for the doctor and never blocks your booking."
                  delay="anim-delay-3"
                />
              </div>
            </div>
            {/* Illustration */}
            <div className={`transition-all duration-700 delay-150 ${s2.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="w-full max-w-xs mx-auto mt-10 lg:mt-0">
                <IllusAI />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 3 ────────────────────────────────────────── */}
      <section id="step3" ref={s3.ref} style={{ background: "white", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Illustration */}
            <div className={`transition-all duration-700 ${s3.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="w-full max-w-xs mx-auto lg:mx-0">
                <IllusDoctor />
              </div>
            </div>
            {/* Content */}
            <div className={`transition-all duration-700 delay-150 ${s3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <SectionHeader
                step="3"
                heading="Meet your ophthalmologist"
                sub="A video consultation with a registered doctor who already has your triage summary."
              />
              <div className="flex flex-col gap-4">
                <FeatureCard
                  icon={<IconVideo />}
                  title="A consult that starts warm"
                  body="No repeating your history from scratch. The doctor opens with your acuity result, symptoms and photo notes on screen."
                  delay="anim-delay-1"
                />
                <FeatureCard
                  icon={<IconRefresh />}
                  title="If the connection drops"
                  body="The call falls back to audio-only, or you're moved into a reschedule flow. You're never left stuck."
                  delay="anim-delay-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 4 ────────────────────────────────────────── */}
      <section
        id="step4"
        ref={s4.ref}
        style={{ background: "var(--mint-alt)", paddingTop: "80px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}
      >
        <BlobAccent className="w-96 h-96 -top-32 -right-32 opacity-40" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          {/* Header spans full width */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className={`transition-all duration-700 ${s4.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <SectionHeader
                step="4"
                heading="E-prescription and a recall date that's yours"
                sub="Delivered on WhatsApp, with SMS and email as backup."
                light
              />
              <div className="flex flex-col gap-4">
                <FeatureCard
                  icon={<IconFile />}
                  title="Structured e-prescription"
                  body="Diagnosis, medication and advice in a clear format, as a downloadable PDF."
                  delay="anim-delay-1"
                />
                <FeatureCard
                  icon={<IconCalendar />}
                  title="Personalized recall"
                  body={'A simple risk score — from your diagnosis and diabetes status — sets a specific "come back by" date instead of a generic annual nudge.'}
                  delay="anim-delay-2"
                />
              </div>
            </div>
            {/* Illustration */}
            <div className={`transition-all duration-700 delay-150 ${s4.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="w-full max-w-xs mx-auto">
                <IllusPrescription />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY & REGULATION ───────────────────────────── */}
      <section ref={safety.ref} style={{ background: "white", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div
            className={`rounded-3xl p-10 lg:p-14 text-center transition-all duration-700 ${safety.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              background: "linear-gradient(135deg, var(--teal-50) 0%, #e8f7f5 100%)",
              border: "1.5px solid var(--teal-200)",
            }}
          >
            {/* Shield motif */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 mx-auto" style={{ background: "var(--teal-100)" }}>
              <IconShield />
            </div>
            {/* Eyebrow */}
            <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'DM Mono', monospace", color: "var(--teal-600)" }}>
              Safety &amp; Regulation
            </p>
            <p className="text-base leading-relaxed" style={{ color: "var(--body-text)", maxWidth: "56ch", margin: "0 auto" }}>
              ClearSight follows India&apos;s Telemedicine Practice Guidelines (2020):
              consultations only with registered doctors, proper documentation, and AI
              that is assistive only and never presented as a diagnosis. Health data is
              encrypted in transit and at rest, with DPDP-aligned consent and the right
              to delete your data.
            </p>
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {["Telemedicine Act 2020", "DPDP Aligned", "End-to-end encrypted"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                  style={{ background: "white", color: "var(--teal-700)", border: "1px solid var(--teal-200)", fontFamily: "'DM Mono', monospace" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section ref={cta.ref} style={{ background: "var(--mint-alt)", paddingTop: "64px", paddingBottom: "80px" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div
            className={`rounded-3xl overflow-hidden transition-all duration-700 ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              background: "linear-gradient(135deg, var(--navy) 0%, var(--teal-900) 100%)",
              padding: "64px 56px",
              position: "relative",
            }}
          >
            {/* decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: "var(--teal-700)", opacity: 0.25, transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: "var(--teal-500)", opacity: 0.15, transform: "translate(-30%, 30%)" }} />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Ready when you are
                </h2>
                <p style={{ color: "var(--teal-200)", fontSize: "1.05rem", lineHeight: "1.65" }}>
                  Book a consult and start the guided self-test — about five minutes.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-base transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--green-cta)",
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: "0 10px 32px rgba(58,125,85,0.4)",
                    fontSize: "1.05rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--green-cta-hov)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--green-cta)")}
                >
                  Book a consult
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
