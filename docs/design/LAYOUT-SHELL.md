# ClearSight — Layout Shell (Step 2)

Builds on [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md). Defines the app skeleton every
page hangs off: framework, route structure, the 3 shells, container/breakpoint
primitives, and the shared component inventory. No page content yet — that's
Steps 3–4.

---

## 1. Stack — recommended

| Choice | Why |
|---|---|
| **Next.js 14 (App Router)** | One app, role-based views via route groups (matches spec §6). SSR + metadata for the marketing site's SEO; the app screens stay client-rendered. Route groups give clean per-role layouts without separate frontends. |
| **Tailwind + shadcn/ui** | shadcn is copy-in, not a dep — components live in our repo, themed by the Step 1 tokens. Zero runtime cost, fully modular. |
| **Framer Motion** | Already speced in `lib/motion.ts`. |
| **react-hook-form + zod** | Intake forms + prescription form need real validation; shadcn `<Form>` wraps both. |
| **Lucide** | Icon set shadcn ships with. No emoji. |
| **TanStack Query** *(Step 6, not now)* | Data fetching when the backend lands. UI phase uses static mock modules. |

> Lighter alternative considered: **Vite + React Router**. Rejected — the marketing
> site wants SSR/metadata and we'd bolt that back on later. Next.js covers both
> halves in one toolchain. If SEO is deprioritized, Vite is a valid swap and
> nothing below changes except the router.

---

## 2. Route structure

```
src/app/
  layout.tsx                 root — fonts, <body> tokens, <Toaster>, providers
  globals.css                = tokens.css from Step 1

  (marketing)/               → MarketingShell   (public, SSR)
    page.tsx                    home
    how-it-works/page.tsx
    for-doctors/page.tsx
    pricing/page.tsx
    about/page.tsx
    legal/[doc]/page.tsx       privacy / terms / telemedicine-guidelines

  (auth)/                     → FocusShell (bare)
    login/page.tsx             phone/email OTP

  (patient)/
    dashboard/page.tsx          → AppShell   tabbed: overview · appointments · prescriptions · recalls (?tab=)
    appointments/[id]/page.tsx  → AppShell   drill-in detail
    profile/page.tsx            → AppShell
    intake/[step]/page.tsx      → FocusShell questionnaire · acuity · photos · review
    book/page.tsx               → FocusShell doctor + slot pick, pay
    consult/[id]/page.tsx       → FocusShell video room

  (doctor)/                   → AppShell
    dashboard/page.tsx        today's queue + triage summaries
    queue/page.tsx
    availability/page.tsx
    patients/[id]/page.tsx    history
    profile/page.tsx
    consult/[id]/page.tsx     → FocusShell  call + prescription pane

  (admin)/
    page.tsx                   → AppShell   tabbed: doctors · bookings · payments · analytics (?tab=)
                                            detail views open in a <Sheet>, not routes
```

Role gating (Step 6) is middleware on the group folders. UI phase renders all
routes freely with mock role data.

---

## 3. The three shells

### MarketingShell — public pages
- **Top nav** (`MarketingNav`): standard full-width sticky bar, 64px, `z-40`.
  Transparent over the hero → frosts to `bg-surface/82 backdrop-blur border-b
  border-border shadow-sm` after 8px scroll. Inner row `max-w-content px-8`.
  Logo left · links centred (How it works · For doctors ▾ · Pricing · About) ·
  `Log in` (ghost) + `Book consult` (CTA) right.
- **Notch detail**: two concave scoops bitten from the bar's bottom edge — one
  beside the logo cluster, one beside the action cluster — via a CSS `mask` of
  two radial gradients positioned under the real gaps, recomputed on resize.
  Both on by default (`logoNotch` / `actionNotch` props). Signature flourish;
  purely cosmetic, no layout impact.
- **Dropdown** (`For doctors ▾`): shadcn `DropdownMenu`, restyled to the
  reference — 300px white panel, `shadow-lg`, Lucide icon rows, active row
  `bg-primary-subtle text-primary-subtle-fg` + teal check.
- **Mobile (<md)**: centre links collapse; logo + hamburger → shadcn `<Sheet>`
  drawer, full-height, links stacked, CTA pinned bottom. Ghost `Log in` hides.
- Preview: `docs/design/previews/clearsight-navbar` (artifact).
- **Footer**: 4 link columns (Product · For patients · For doctors · Company) + legal row + a persistent **"Not for medical emergencies — call your local emergency number"** line in `--muted-foreground`.
- Content: `<Section>` rhythm, `<Container size="content">`.

### AppShell — dashboards (patient home, doctor, admin)
- **Sidebar** (≥lg): fixed 248px, `bg-surface border-r border-border`. Role-aware nav from `nav-config.ts`, Lucide icon + label, active item = `bg-primary-subtle text-primary-subtle-fg`. Logo top, avatar/account menu bottom.
- **Topbar**: 56px, page title / breadcrumb left, notifications bell + avatar menu right. Optional search slot.
- **Mobile (<lg)**: sidebar → off-canvas `<Sheet>` from hamburger in topbar. Respect bottom safe-area.
- Content: `<Container size="wide">` (tables) or `content`, `py-6 md:py-8`.
- Minimal footer: version + "Contact support".

### FocusShell — intake, booking, video consult
- No sidebar, no marketing footer. Distraction-free.
- **Header**: 56px — small logo left · center = `<StepProgress>` (intake/booking) or `<ConsultTimer>` (consult) · right = `Save & exit` / `Leave call`.
- Content: `<Container size="prose">` (≈640px) for forms; consult room goes full-bleed with its own grid.
- Exit confirms if there's unsaved progress.

---

## 4. Layout primitives

```tsx
// components/layout/container.tsx
import { cn } from '@/lib/utils';

const MAX = {
  content: 'max-w-[1152px]',
  wide: 'max-w-[1280px]',
  prose: 'max-w-[640px]',
} as const;

export function Container({
  size = 'content',
  className,
  children,
}: {
  size?: keyof typeof MAX;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full px-4 md:px-6 lg:px-8', MAX[size], className)}>
      {children}
    </div>
  );
}
```

```tsx
// components/layout/section.tsx  — marketing vertical rhythm
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section className={cn('py-16 md:py-20 lg:py-24', className)} {...props}>
      {children}
    </section>
  );
}
```

```tsx
// components/layout/page-header.tsx  — app screens
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-heading">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}
```

### Breakpoints — Tailwind defaults, unchanged
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`

| Transition | At |
|---|---|
| Marketing nav → drawer | `< md` |
| AppShell sidebar → off-canvas | `< lg` |
| Multi-column marketing sections → stacked | `< md` |
| Dashboard tables → card list or horizontal scroll container | `< md` |

Page gutters: `16px` → `24px` (md) → `32px` (lg), baked into `<Container>`.

---

## 5. Shared component inventory

### From shadcn/ui (add via CLI, themed by tokens — no restyle)
`button · input · label · textarea · select · checkbox · radio-group ·
form · dialog · sheet · dropdown-menu · popover · tooltip · tabs ·
accordion · avatar · badge · card · separator · skeleton · sonner (toast) ·
alert · table · calendar · command`

One override file maps shadcn variants to our tokens (e.g. `button` gets a
`cta` variant = `bg-cta`, sizes 36/44/52).

### Custom (ClearSight — `components/common/`)
| Component | Purpose |
|---|---|
| `Logo` / `Brandmark` | wordmark + eye glyph, `sm`/`md` |
| `TriageBadge` | `state: 'normal' \| 'review' \| 'urgent'` → icon + label + token colours (never colour-alone) |
| `EmergencyBanner` | red-flag alert, `role="alert"`, static under reduced-motion |
| `DataField` / `Stat` | mono value + uppercase label, `tabular-nums` — acuity, Rx codes, timestamps |
| `EmptyState` | icon + title + hint + optional action, for empty queues/lists |
| `StepProgress` | numbered intake steps, current/done/upcoming |
| `ConsultTimer` | elapsed call time, mono |

### Layout (`components/layout/`)
`Container · Section · PageHeader · MarketingNav · MarketingFooter ·
AppSidebar · AppTopbar · FocusHeader · MarketingShell · AppShell · FocusShell`

### `lib/`
`utils.ts` (`cn`) · `motion.ts` (Step 1 presets) · `nav-config.ts` (role → nav
items) · `mock/` (static data modules for the UI phase)

---

## 6. Root wiring

```tsx
// app/layout.tsx
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: { default: 'ClearSight — Eye care, on a video call', template: '%s · ClearSight' },
  description: 'AI-assisted pre-screening and video consultations with registered ophthalmologists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* font <link> tags from DESIGN-SYSTEM.md §1 */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

Page content animates in per-route with `routeTransition` from `lib/motion.ts`,
wrapped once inside each shell's content slot.

---

## 7. Resolved decisions

- **Stack**: Next.js 14 App Router — confirmed.
- **Patient home**: uses `AppShell` (sidebar + topbar), same as doctor/admin,
  with a shorter nav list (Appointments · Prescriptions · Recalls · Profile).
  Consistency + room to grow.
