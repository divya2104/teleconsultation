# ClearSight — Design System (Step 1: Theme)

**Theme:** Calm Care — soft-modern healthcare, teal/cyan, reassuring but crisp.
Bar: Linear / Vercel / Stripe. **Light mode only for v1**; tokens are named so a
`.dark` block can be added later without touching components.

**Discipline rule:** color is used almost only where it carries meaning
(brand identity, primary action, or clinical triage state). Body UI is
near-neutral. Never invent a hex in a component — reference a token.

Stack: React + Vite + Tailwind + shadcn/ui, Framer Motion. Modular, light.

---

## 1. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Figtree** — headings / display. Weights 400–700, tracking `-0.02em` at ≥30px.
- **Inter** — body, UI, labels. Weights 400/500/600. Body line-height 1.6.
- **JetBrains Mono** — numeric data only: acuity scores, Rx codes, timestamps, IDs.

---

## 2. `tokens.css` — primitive + semantic layers

> Becomes the `@layer base` block of `app/globals.css`. shadcn/ui core tokens are
> provided as HSL triplets (so `bg-primary/60` opacity utilities work); the
> extended semantic set uses hex.

```css
:root {
  /* ---------- PRIMITIVES ---------- */
  --white: #ffffff;

  --teal-50:  #f0fdfa;  --teal-100: #ccfbf1;  --teal-200: #99f6e4;
  --teal-300: #5eead4;  --teal-400: #2dd4bf;  --teal-500: #14b8a6;
  --teal-600: #0e7c86;  --teal-700: #0b5d66;  --teal-800: #08464d;
  --teal-ink: #0f2d2b;

  --cyan-400: #22d3ee;  --cyan-500: #06b6d4;  --cyan-600: #0891b2;
  --cyan-subtle: #e0f7fc;

  --green-500: #10b981; --green-600: #059669; --green-700: #047857;
  --green-subtle: #e7f6ef;

  --amber-500: #f59e0b; --amber-600: #d97706; --amber-700: #b45309;
  --amber-subtle: #fdf1e3;

  --red-500: #ef4444;   --red-600: #dc2626;   --red-700: #b91c1c;
  --red-subtle: #fcebeb;

  --slate-50:  #f8fafc; --slate-100: #f1f5f9; --slate-200: #e2e8f0;
  --slate-300: #cbd5e1; --slate-400: #94a3b8; --slate-500: #64748b;
  --slate-600: #475569; --slate-700: #334155; --slate-800: #1e293b;
  --slate-900: #0f172a;

  --brand-bg:      #f7fefd;  /* faint teal page ground */
  --brand-muted:   #edf9f7;  /* teal-tinted muted surface */
  --brand-border:  #ccfbf1;  /* teal-tinted hairline */

  /* ---------- SEMANTIC (light) ---------- */
  --background:        var(--brand-bg);
  --surface:           var(--white);   /* = card / popover */
  --surface-muted:     var(--brand-muted);
  --foreground:        var(--slate-800);  /* body text */
  --heading:           var(--slate-900);
  --muted-foreground:  var(--slate-500);  /* secondary text, ≥16px only  */
  --muted-foreground-strong: var(--slate-600); /* <16px secondary text   */

  --border:        var(--slate-200);
  --border-strong: var(--slate-300);
  --border-brand:  var(--brand-border);

  --primary:            var(--teal-600);
  --primary-hover:      var(--teal-700);
  --primary-active:     var(--teal-800);
  --on-primary:         var(--white);
  --primary-subtle:     #e6fbf7;
  --primary-subtle-fg:  var(--teal-700);

  --secondary:          var(--cyan-600);
  --on-secondary:       var(--white);
  --secondary-subtle:   var(--cyan-subtle);

  --cta:            var(--green-600);   /* "Book consult", pay, confirm */
  --cta-hover:      var(--green-700);
  --on-cta:         var(--white);

  --ring:          var(--teal-600);

  /* clinical triage — the one place color is load-bearing */
  --triage-normal:      var(--green-600);
  --triage-normal-bg:   var(--green-subtle);
  --triage-normal-fg:   var(--green-700);
  --triage-review:      var(--amber-600);
  --triage-review-bg:   var(--amber-subtle);
  --triage-review-fg:   var(--amber-700);
  --triage-urgent:      var(--red-600);
  --triage-urgent-bg:   var(--red-subtle);
  --triage-urgent-fg:   var(--red-700);

  --info:          var(--cyan-600);   --info-bg:    var(--cyan-subtle);
  --success:       var(--triage-normal);
  --warning:       var(--triage-review);
  --danger:        var(--triage-urgent);
  --destructive:       var(--red-600);
  --on-destructive:    var(--white);
  --destructive-subtle: var(--red-subtle);

  /* ---------- RADII ---------- */
  --radius-sm: 8px;    /* chips, small controls */
  --radius-md: 10px;   /* buttons, inputs (default)  */
  --radius-lg: 14px;   /* cards */
  --radius-xl: 20px;   /* modals, hero panels */
  --radius-full: 9999px;
  --radius: var(--radius-md);  /* shadcn base */

  /* ---------- SPACING (4px base, "airier": jumps after 16) ---------- */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-7: 40px;  --space-8: 64px;
  --space-9: 96px;  --space-10: 128px;

  /* ---------- LAYOUT ---------- */
  --container-content: 1152px;  /* marketing + app content */
  --container-wide:    1280px;  /* dashboard tables */
  --gutter: 16px;               /* 24px @md, 32px @lg — set in shell */

  /* ---------- ELEVATION (soft, WCAG-safe — not neumorphism) ---------- */
  --shadow-xs: 0 1px 2px rgba(15,23,42,.04);
  --shadow-sm: 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);
  --shadow-md: 0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04);
  --shadow-lg: 0 12px 32px rgba(15,23,42,.10), 0 4px 8px rgba(15,23,42,.05);
  --shadow-focus: 0 0 0 3px rgba(14,124,134,.35);
  --hero-wash: linear-gradient(135deg, #f0fdfa 0%, #e0f7fc 45%, #ffffff 100%);

  /* ---------- TYPE SCALE  (px / line-height / tracking) ---------- */
  --text-xs:   .75rem;   --lh-xs:   1rem;
  --text-sm:   .875rem;  --lh-sm:   1.25rem;
  --text-base: 1rem;     --lh-base: 1.6;
  --text-lg:   1.125rem; --lh-lg:   1.75rem;
  --text-xl:   1.25rem;  --lh-xl:   1.75rem;
  --text-2xl:  1.5rem;   --lh-2xl:  2rem;
  --text-3xl:  1.875rem; --lh-3xl:  2.375rem;
  --text-4xl:  2.375rem; --lh-4xl:  2.75rem;
  --text-5xl:  3rem;     --lh-5xl:  3.25rem;   /* hero desktop; clamp on mobile */

  --font-heading: 'Figtree', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-body:    'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* ---------- MOTION ---------- */
  --dur-instant: 80ms;  --dur-fast: 150ms;  --dur-base: 240ms;
  --dur-slow: 360ms;    --dur-slower: 480ms;
  --ease-out:   cubic-bezier(.16, 1, .3, 1);
  --ease-in:    cubic-bezier(.4, 0, 1, 1);
  --ease-inout: cubic-bezier(.65, 0, .35, 1);

  /* ---------- shadcn/ui core (HSL triplets) ---------- */
  --sh-background: 168 60% 98%;
  --sh-foreground: 217 33% 17%;
  --sh-card: 0 0% 100%;
  --sh-card-foreground: 217 33% 17%;
  --sh-popover: 0 0% 100%;
  --sh-popover-foreground: 217 33% 17%;
  --sh-primary: 185 81% 29%;
  --sh-primary-foreground: 0 0% 100%;
  --sh-secondary: 192 91% 36%;
  --sh-secondary-foreground: 0 0% 100%;
  --sh-muted: 170 40% 95%;
  --sh-muted-foreground: 215 16% 47%;
  --sh-accent: 160 84% 30%;
  --sh-accent-foreground: 0 0% 100%;
  --sh-destructive: 0 72% 51%;
  --sh-destructive-foreground: 0 0% 100%;
  --sh-border: 214 32% 91%;
  --sh-input: 213 27% 84%;
  --sh-ring: 185 81% 29%;
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-instant: 0ms; --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; --dur-slower: 0ms; }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--lh-base);
  -webkit-font-smoothing: antialiased;
}
h1,h2,h3,h4 { font-family: var(--font-heading); color: var(--heading); font-weight: 600; letter-spacing: -0.02em; }
```

---

## 3. Tailwind config snippet (`tailwind.config.ts` → `theme.extend`)

```ts
extend: {
  colors: {
    // shadcn core — hsl() wrappers so /opacity works
    background: 'hsl(var(--sh-background))',
    foreground: 'hsl(var(--sh-foreground))',
    card: { DEFAULT: 'hsl(var(--sh-card))', foreground: 'hsl(var(--sh-card-foreground))' },
    popover: { DEFAULT: 'hsl(var(--sh-popover))', foreground: 'hsl(var(--sh-popover-foreground))' },
    primary: { DEFAULT: 'hsl(var(--sh-primary))', foreground: 'hsl(var(--sh-primary-foreground))' },
    secondary: { DEFAULT: 'hsl(var(--sh-secondary))', foreground: 'hsl(var(--sh-secondary-foreground))' },
    muted: { DEFAULT: 'hsl(var(--sh-muted))', foreground: 'hsl(var(--sh-muted-foreground))' },
    accent: { DEFAULT: 'hsl(var(--sh-accent))', foreground: 'hsl(var(--sh-accent-foreground))' },
    destructive: { DEFAULT: 'hsl(var(--sh-destructive))', foreground: 'hsl(var(--sh-destructive-foreground))' },
    border: 'hsl(var(--sh-border))',
    input: 'hsl(var(--sh-input))',
    ring: 'hsl(var(--sh-ring))',

    // ClearSight semantic extensions (direct var refs)
    cta: { DEFAULT: 'var(--cta)', hover: 'var(--cta-hover)', foreground: 'var(--on-cta)' },
    surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)' },
    heading: 'var(--heading)',
    'border-brand': 'var(--border-brand)',
    triage: {
      normal: 'var(--triage-normal)', 'normal-bg': 'var(--triage-normal-bg)', 'normal-fg': 'var(--triage-normal-fg)',
      review: 'var(--triage-review)', 'review-bg': 'var(--triage-review-bg)', 'review-fg': 'var(--triage-review-fg)',
      urgent: 'var(--triage-urgent)', 'urgent-bg': 'var(--triage-urgent-bg)', 'urgent-fg': 'var(--triage-urgent-fg)',
    },
  },
  fontFamily: {
    heading: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
  boxShadow: {
    xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
  },
  maxWidth: { content: '1152px', wide: '1280px' },
  transitionTimingFunction: { out: 'var(--ease-out)', in: 'var(--ease-in)', inout: 'var(--ease-inout)' },
}
```

---

## 4. `lib/motion.ts` — Framer Motion presets

Principles: motion confirms cause → effect and spatial continuity, never
decoration. Exit is always faster than enter. `useReducedMotion()` collapses
everything to final state (opacity ≤120ms max).

```ts
import type { Variants, Transition } from 'framer-motion';

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  inout: [0.65, 0, 0.35, 1] as const,
};

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 };
export const springSettle: Transition = { type: 'spring', stiffness: 260, damping: 18 }; // playful overshoot

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: ease.out } },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: ease.out } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } },
};

export const cardHover = {
  whileHover: { y: -3, boxShadow: 'var(--shadow-md)', transition: { duration: 0.15, ease: ease.out } },
  whileTap: { y: 0, scale: 0.99 },
};

export const pressable = { whileTap: { scale: 0.97, transition: spring } };

export const routeTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: ease.out } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: ease.in } },
};

// Emergency banner ONLY. Becomes static high-contrast under reduced motion.
export const pulseUrgent: Variants = {
  show: { opacity: [1, 0.6, 1], transition: { duration: 1.6, repeat: Infinity, ease: ease.inout } },
};

// Standard scroll-reveal usage:
//   <motion.section variants={sectionReveal} initial="hidden"
//     whileInView="show" viewport={{ once: true, margin: '-15%' }} />
```

---

## 5. Component-token layer (thin — only reused primitives)

```css
:root {
  --button-radius: var(--radius-md);
  --button-h-sm: 36px;  --button-h-md: 44px;  --button-h-lg: 52px;  /* 44 = touch target */
  --input-h: 44px;      --input-radius: var(--radius-md);  --input-border: var(--border-strong);
  --card-radius: var(--radius-lg);  --card-padding: var(--space-5);  --card-shadow: var(--shadow-sm);
  --focus-ring: var(--shadow-focus);
}
```

---

## 6. Guardrails (from UX intelligence pass)

- Contrast ≥ 4.5:1 body, ≥ 3:1 large text / UI. `--muted-foreground` (slate-500)
  is for ≥16px only; use `--muted-foreground-strong` below that.
- Focus visible on every interactive element (`--focus-ring`), never removed.
- Touch targets ≥ 44×44px, ≥ 8px apart.
- No emoji as icons — Lucide (ships with shadcn).
- Triage state must never rely on color alone: always pair with a label
  ("Urgent", "Routine") and an icon.
- `prefers-reduced-motion`: transforms off, opacity fades ≤120ms.
- Responsive checkpoints: 375 / 768 / 1024 / 1440.
- Emergency ("seek in-person care now") banner: `--triage-urgent` bg-fg pair,
  static under reduced motion, top of viewport, dismiss disabled.
```
