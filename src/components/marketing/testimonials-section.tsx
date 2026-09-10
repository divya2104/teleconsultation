"use client";

import { useEffect, useRef, useState } from "react";

/* ─── PLACEHOLDER — replace with real, consented testimonials ───────────────
   Names, cities and quotes below are illustrative. Swap for real, consented
   patient testimonials before a public launch. Ported from the Figma design.
   ─────────────────────────────────────────────────────────────────────────── */

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  city: string;
  initials: string;
  avatarColor: keyof typeof AVATAR_COLORS;
  rating: number;
  contextTag?: string;
  featured?: boolean;
};

// Solid, saturated avatar fills (white initials on top).
const AVATAR_COLORS = {
  teal: "bg-teal-600",
  sage: "bg-emerald-600",
  sky: "bg-sky-600",
  indigo: "bg-indigo-600",
  rose: "bg-pink-600",
  amber: "bg-orange-500",
} as const;

const STAR_GOLD = "#F5A623";

const TESTIMONIALS: Testimonial[] = [
  {
    id: "feat-1",
    quote:
      "I live near Nagpur and the nearest specialist is over two hours away. With ClearSight the doctor already had my previous prescription when we connected — I didn't have to repeat anything. Got clarity on my medication the same morning.",
    name: "Meera S.",
    city: "Wardha, Maharashtra",
    initials: "MS",
    avatarColor: "teal",
    rating: 5,
    contextTag: "Follow-up consultation",
    featured: true,
  },
  {
    id: "t-2",
    quote:
      "Booking took under three minutes. The doctor was patient, explained the redness clearly. No queue, no auto-rickshaw in afternoon heat.",
    name: "Rohan K.",
    city: "Bengaluru, Karnataka",
    initials: "RK",
    avatarColor: "sky",
    rating: 5,
    contextTag: "Booked for: red, watering eye",
  },
  {
    id: "t-3",
    quote:
      "Connected during a layover in Delhi and had my updated prescription before I boarded. Exactly what I needed.",
    name: "Priya N.",
    city: "Chennai, Tamil Nadu",
    initials: "PN",
    avatarColor: "indigo",
    rating: 5,
    contextTag: "Prescription renewal",
  },
  {
    id: "t-4",
    quote:
      "My father is 72 and not comfortable travelling alone post-cataract. Being able to check in with a specialist from home made a real difference for our family.",
    name: "Aditya V.",
    city: "Hyderabad, Telangana",
    initials: "AV",
    avatarColor: "sage",
    rating: 4,
    contextTag: "Post-surgery follow-up",
  },
  {
    id: "t-5",
    quote:
      "The doctor took time to understand my screen-time habits and gave practical advice I could start immediately. Very reassuring.",
    name: "Sneha R.",
    city: "Pune, Maharashtra",
    initials: "SR",
    avatarColor: "rose",
    rating: 5,
    contextTag: "Booked for: digital eye strain",
  },
  {
    id: "t-6",
    quote:
      "Easy to use, video was clear, and the prescription was accurate when I collected my lenses from the local optician.",
    name: "Karthik M.",
    city: "Coimbatore, Tamil Nadu",
    initials: "KM",
    avatarColor: "amber",
    rating: 5,
    contextTag: "New prescription",
  },
  {
    id: "t-7",
    quote:
      "I was anxious about my child's eye exam but the doctor was calm and thorough. We got the right spectacle number on the first visit.",
    name: "Divya P.",
    city: "Ahmedabad, Gujarat",
    initials: "DP",
    avatarColor: "indigo",
    rating: 5,
    contextTag: "Child's first eye exam",
  },
  {
    id: "t-8",
    quote:
      "Sudden floaters had me worried. The specialist explained exactly what was happening and when I'd need to follow up in person. Felt genuinely heard.",
    name: "Sanjay T.",
    city: "Jaipur, Rajasthan",
    initials: "ST",
    avatarColor: "teal",
    rating: 5,
    contextTag: "Booked for: new floaters",
  },
  {
    id: "t-9",
    quote:
      "I manage a small shop and can't take half a day off for a clinic visit. This was done in my lunch break. The doctor was professional and spoke in Kannada.",
    name: "Ravi B.",
    city: "Mysuru, Karnataka",
    initials: "RB",
    avatarColor: "sage",
    rating: 5,
    contextTag: "Prescription renewal",
  },
  {
    id: "t-10",
    quote:
      "I'd been ignoring mild blurring for months. Quick consult, clear next steps, picked up glasses that actually work. Wish I'd done it sooner.",
    name: "Anjali R.",
    city: "Pune, Maharashtra",
    initials: "AR",
    avatarColor: "rose",
    rating: 5,
    contextTag: "Booked for: blurry vision",
  },
  {
    id: "t-11",
    quote:
      "The doctor reviewed my previous reports before we even started talking. Felt like a proper consultation, not a rushed triage call.",
    name: "Farhan A.",
    city: "Lucknow, Uttar Pradesh",
    initials: "FA",
    avatarColor: "sky",
    rating: 5,
    contextTag: "Diabetic eye review",
  },
  {
    id: "t-12",
    quote:
      "My contact lens prescription needed a small update. Handled completely online, prescription reached my email within minutes.",
    name: "Kavitha L.",
    city: "Visakhapatnam, Andhra Pradesh",
    initials: "KL",
    avatarColor: "amber",
    rating: 4,
    contextTag: "Contact lens prescription",
  },
  {
    id: "t-13",
    quote:
      "After LASIK the follow-up visits are so much easier this way. The doctor checks my healing photos and gives clear feedback. Saves two clinic trips a month.",
    name: "Nikhil D.",
    city: "Mumbai, Maharashtra",
    initials: "ND",
    avatarColor: "teal",
    rating: 5,
    contextTag: "Post-LASIK follow-up",
  },
  {
    id: "t-14",
    quote:
      "I'm a nurse and I know how hard it is to get specialist time. ClearSight connected me to an ophthalmologist in minutes. The care was thorough and unhurried.",
    name: "Sunita G.",
    city: "Bhopal, Madhya Pradesh",
    initials: "SG",
    avatarColor: "indigo",
    rating: 5,
    contextTag: "Booked for: dry, itchy eyes",
  },
];

const STATS = [
  { figure: "4.8/5", label: "average rating" },
  { figure: "12,000+", label: "consults completed" },
  { figure: "~6 min", label: "avg. time to connect" },
  { figure: "18 states", label: "patients served" },
];

const STAR_PATH =
  "M7 1.5l1.545 3.13 3.455.502-2.5 2.436.59 3.44L7 9.385l-3.09 1.623.59-3.44L2 5.132l3.455-.502z";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill={n <= rating ? STAR_GOLD : "none"}
          stroke={n <= rating ? STAR_GOLD : "#cbd5e1"}
          strokeWidth="1.2"
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function MarqueeCard({ t }: { t: Testimonial }) {
  return (
    <div
      style={{ boxShadow: "var(--shadow-md)" }}
      className="flex h-full select-none flex-col gap-3 rounded-[16px] bg-white p-5"
    >
      <Stars rating={t.rating} size={13} />
      <p className="line-clamp-4 flex-1 text-[14px] leading-relaxed text-slate-700">
        &ldquo;{t.quote}&rdquo;
      </p>
      {t.contextTag ? (
        <span className="inline-flex items-center gap-1.5 self-start text-[11px] font-medium text-teal-600">
          <span className="size-1 rounded-full bg-teal-500" />
          {t.contextTag}
        </span>
      ) : null}
      <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3">
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-full font-heading text-xs font-bold tracking-tight text-white ${AVATAR_COLORS[t.avatarColor]}`}
          aria-hidden
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-[12px] font-semibold leading-tight text-slate-900">
            {t.name}
          </p>
          <p className="truncate text-[11px] text-slate-400">{t.city}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
  paused,
}: {
  items: Testimonial[];
  direction: "left" | "right";
  speed: number;
  paused: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#ddf2ee] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#ddf2ee] to-transparent sm:w-24" />
      <div
        className="flex w-max gap-4"
        style={{
          animation: `ts-marquee-${direction} ${(items.length * 280) / speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((t, i) => (
          <div key={`${t.id}-${i}`} className="w-[300px] shrink-0">
            <MarqueeCard t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    // backstop: some embedded browsers don't fire IO — reveal anyway
    const t = setTimeout(() => setVisible(true), 1200);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, []);

  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rowA = TESTIMONIALS.slice(0, half);
  const rowB = TESTIMONIALS.slice(half);
  const reveal = (delay: number) =>
    visible
      ? { className: "animate-fade-rise", style: { animationDelay: `${delay}ms` } }
      : { className: "opacity-0", style: undefined };

  return (
    <section
      ref={ref}
      className="w-full overflow-hidden border-y border-border bg-[#ddf2ee] py-16 md:py-20 lg:py-24"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto w-full max-w-[var(--container-content)] px-5 sm:px-6 lg:px-8">
        <div {...reveal(0)} className={`text-center ${reveal(0).className}`}>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Trusted by patients
          </p>
          <h2
            id="testimonials-heading"
            className="mx-auto mt-2 max-w-2xl text-3xl"
          >
            Care that reached them at home
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Specialist care, wherever you are — no travel, no long waits.
          </p>
        </div>

        <div
          {...reveal(60)}
          className={`mt-8 flex flex-wrap justify-center gap-3 ${reveal(60).className}`}
          aria-label="Service statistics — illustrative"
        >
          {STATS.map((s) => (
            <div
              key={s.figure}
              style={{ boxShadow: "var(--shadow-md)" }}
              className="flex items-center gap-3 rounded-[12px] bg-white px-5 py-3"
            >
              <span className="shrink-0" aria-hidden style={{ color: STAR_GOLD }}>
                <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor">
                  <path d={STAR_PATH} />
                </svg>
              </span>
              <div>
                <span className="font-mono text-[15px] font-semibold leading-none tracking-tight text-slate-900">
                  {s.figure}
                </span>
                <span className="ml-2 text-[13px] leading-none text-slate-500">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        {...reveal(120)}
        className={`mt-12 flex flex-col gap-4 ${reveal(120).className}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <MarqueeRow items={rowA} direction="left" speed={30} paused={paused} />
        <MarqueeRow items={rowB} direction="right" speed={28} paused={paused} />
      </div>

      <div className="mx-auto mt-8 w-full max-w-[var(--container-content)] px-5 text-center sm:px-6 lg:px-8">
        <p className="font-mono text-xs text-muted-foreground">
          Illustrative patient experiences · not a substitute for in-person
          emergency care.
        </p>
      </div>
    </section>
  );
}
