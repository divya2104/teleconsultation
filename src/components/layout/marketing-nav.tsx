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
    <div className="sticky top-0 z-50 w-full">
      {/* desktop */}
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto hidden w-full border-border md:block",
          TRANSITION,
          floating
            ? "mt-3 max-w-[820px] rounded-full border-transparent bg-surface/80 shadow-[var(--shadow-nav)] [backdrop-filter:blur(10px)]"
            : "mt-0 max-w-none rounded-none border-b bg-surface shadow-sm",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-4 pt-3 pb-[17px]",
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
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground-strong transition-colors hover:text-heading"
            >
              Log in
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 rounded-full bg-heading px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-raised)] transition-transform hover:-translate-y-0.5"
            >
              <CalendarPlus className="size-4" />
              Book consult
            </Link>
          </div>
        </div>
      </nav>

      {/* mobile */}
      <nav
        className={cn(
          "relative mx-auto flex items-center justify-between border-border px-4 py-2.5 md:hidden",
          TRANSITION,
          floating
            ? "mt-2 w-[calc(100%-1rem)] rounded-3xl border-transparent bg-surface/90 shadow-[var(--shadow-nav)] [backdrop-filter:blur(10px)]"
            : "mt-0 w-full rounded-none border-b bg-surface shadow-sm",
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
              className="absolute inset-x-2 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-[--radius-lg] border border-border bg-surface p-3 shadow-[var(--shadow-nav)]"
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
                  className="rounded-full bg-heading px-4 py-2 text-center text-sm font-semibold text-white shadow-[var(--shadow-raised)]"
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

function NavLinks() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {LINKS.map((item, i) => {
        const active = pathname === item.href;
        const inner = (
          <>
            {hovered === i ? (
              <motion.span
                layoutId="nav-hover"
                className="absolute inset-0 rounded-full bg-surface-muted"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 inline-flex items-center gap-1",
                active ? "text-heading" : "text-muted-foreground-strong",
              )}
            >
              {item.label}
              {item.dropdown ? <ChevronDown className="size-3.5" /> : null}
            </span>
          </>
        );

        if (item.dropdown) {
          return (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger asChild>
                <button
                  onMouseEnter={() => setHovered(i)}
                  className="relative rounded-full px-3 py-1.5 text-sm font-medium outline-none"
                >
                  {inner}
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
            onMouseEnter={() => setHovered(i)}
            aria-current={active ? "page" : undefined}
            className="relative rounded-full px-3 py-1.5 text-sm font-medium outline-none"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
