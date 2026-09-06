"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown, CalendarPlus } from "lucide-react";
import { Logo } from "@/components/common/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { marketingNav, forDoctorsMenu } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "For doctors", href: "/for-doctors", dropdown: true },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const EASE = "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const TRANSITION = `transition-[max-width,width,margin,border-radius,box-shadow,background-color,backdrop-filter,border-color,padding] ${EASE}`;

// applied via inline style — Tailwind v4 arbitrary shadow utilities weren't
// resolving the layered value reliably here
const SHADOW_REST = "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)";
const SHADOW_FLOAT =
  "0 0 24px rgba(15,23,42,0.06), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(15,23,42,0.04), 0 0 4px rgba(15,23,42,0.08), 0 16px 68px rgba(15,23,42,0.05), 0 1px 0 rgba(255,255,255,0.6) inset";
const SHADOW_RAISED =
  "0 0 24px rgba(15,23,42,0.06), 0 1px 1px rgba(0,0,0,0.12), 0 0 0 1px rgba(15,23,42,0.1), 0 4px 10px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.14) inset";

export function MarketingNav() {
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full px-[5px] pt-[5px] transition-[background-color,backdrop-filter,padding] duration-300",
        floating && "bg-background/75 pb-2.5 [backdrop-filter:blur(8px)]",
      )}
    >
      {/* desktop */}
      <nav
        aria-label="Primary"
        style={{ boxShadow: floating ? SHADOW_FLOAT : SHADOW_REST }}
        className={cn(
          "mx-auto hidden w-full border border-border md:block",
          TRANSITION,
          floating
            ? "mt-2 max-w-[820px] rounded-full border-transparent bg-surface"
            : "mt-0 max-w-none rounded-[28px] bg-surface",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-4 py-3",
            EASE,
            "transition-[max-width,padding]",
            floating
              ? "max-w-[788px] px-4"
              : "max-w-[var(--container-content)] px-4 md:px-6 lg:px-8",
          )}
        >
          <Logo />
          <NavLinks />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-[15px] font-bold tracking-tight text-heading transition-colors hover:bg-surface-muted"
            >
              Log in
            </Link>
            <Link
              href="/book"
              style={{ boxShadow: SHADOW_RAISED }}
              className="inline-flex items-center gap-1.5 rounded-full bg-heading px-5 py-2.5 text-[15px] font-bold tracking-tight text-white transition-transform hover:-translate-y-0.5"
            >
              <CalendarPlus className="size-4" />
              Book consult
            </Link>
          </div>
        </div>
      </nav>

      {/* mobile */}
      <nav
        style={{ boxShadow: floating ? SHADOW_FLOAT : SHADOW_REST }}
        className={cn(
          "relative mx-auto flex w-full items-center justify-between border border-border px-4 py-2.5 md:hidden",
          TRANSITION,
          floating
            ? "mt-2 rounded-3xl border-transparent bg-surface"
            : "mt-0 rounded-2xl bg-surface",
        )}
      >
        <Logo />
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid size-9 place-items-center rounded-full text-heading hover:bg-surface-muted"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              style={{ boxShadow: SHADOW_FLOAT }}
              className="absolute inset-x-2 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-[--radius-lg] border border-border bg-surface p-3"
            >
              {marketingNav.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-muted-foreground-strong hover:bg-surface-muted hover:text-heading"
                >
                  {i.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border-strong px-4 py-2 text-center text-sm font-medium text-heading"
                >
                  Log in
                </Link>
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  style={{ boxShadow: SHADOW_RAISED }}
                  className="rounded-full bg-heading px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Book consult
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </div>
  );
}

const linkBase =
  "inline-flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-bold tracking-tight text-heading outline-none transition-colors duration-150 hover:bg-primary-subtle hover:text-primary-subtle-foreground focus-visible:ring-2 focus-visible:ring-ring/50";

function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5">
      {LINKS.map((item) => {
        const active = pathname === item.href;

        if (item.dropdown) {
          return (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    linkBase,
                    "data-[state=open]:bg-primary-subtle data-[state=open]:text-primary-subtle-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[280px] p-2">
                {forDoctorsMenu.map(({ label, href, icon: Icon }) => (
                  <DropdownMenuItem key={label} asChild className="gap-3 py-2.5">
                    <Link href={href}>
                      <Icon className="size-[17px] text-muted-foreground" />
                      <span className="flex-1">{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              linkBase,
              active && "bg-primary-subtle text-primary-subtle-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
