import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Container } from "@/components/layout/container";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Book a consult", href: "/book" },
    ],
  },
  {
    heading: "For patients",
    links: [
      { label: "Guided intake", href: "/how-it-works#intake" },
      { label: "Recall reminders", href: "/how-it-works#recall" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    heading: "For doctors",
    links: [
      { label: "Practise with us", href: "/for-doctors" },
      { label: "Onboarding", href: "/for-doctors#onboarding" },
      { label: "Earnings", href: "/for-doctors#earnings" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              AI-assisted eye-care pre-screening and video consultations with
              registered ophthalmologists.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground-strong hover:text-heading"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Not for medical emergencies — call your local emergency number or go
            to the nearest hospital.
          </p>
          <div className="flex gap-4">
            <Link href="/legal/telemedicine-consent" className="hover:text-heading">
              Telemedicine consent
            </Link>
            <Link href="/legal/refund-policy" className="hover:text-heading">
              Refund policy
            </Link>
            <span>© {new Date().getFullYear()} ClearSight</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
