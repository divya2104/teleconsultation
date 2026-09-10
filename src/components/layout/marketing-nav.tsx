"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  CalendarPlus,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { marketingNav, forDoctorsMenu, roleHome, type Role } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/db/client-api";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CS"
  );
}

const LINKS = [
  { label: "Home", href: "/" },
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
  const router = useRouter();
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  // null until checked; set once we know the visitor is signed in.
  const [account, setAccount] = useState<{ href: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setAccount({
        href: roleHome[(profile?.role ?? "patient") as Role],
        name: profile?.full_name ?? "Your account",
      });
    });
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.replace("/login");
    router.refresh();
  };

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
            ? "mt-2 max-w-[980px] rounded-full border-transparent bg-surface"
            : "mt-0 max-w-none rounded-[28px] bg-surface",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-4 py-3",
            EASE,
            "transition-[max-width,padding]",
            floating
              ? "max-w-[952px] px-4"
              : "max-w-[var(--container-content)] px-5 md:px-8",
          )}
        >
          <Logo />
          <NavLinks />
          <div className="flex items-center gap-2">
            {account ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/50">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                        {initialsOf(account.name)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block text-xs text-muted-foreground">
                      Signed in as
                    </span>
                    <span className="block truncate text-sm font-medium text-heading">
                      {account.name}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={account.href}>
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="size-4" />
                      Profile &amp; settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium text-heading transition-colors hover:bg-surface-muted"
              >
                Log in
              </Link>
            )}
            <Link
              href="/book"
              style={{ boxShadow: SHADOW_RAISED }}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-cta px-4 py-2 text-[15px] font-medium text-cta-foreground transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-cta-hover"
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
              {account ? (
                <div className="mt-1 border-t border-border pt-2">
                  <p className="px-3 pb-1 text-xs text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-medium text-heading">
                      {account.name}
                    </span>
                  </p>
                  <Link
                    href={account.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-muted-foreground-strong hover:bg-surface-muted hover:text-heading"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-muted-foreground-strong hover:bg-surface-muted hover:text-heading"
                  >
                    <Settings className="size-4" />
                    Profile &amp; settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-[--radius-md] px-3 py-2.5 text-left text-sm font-medium text-muted-foreground-strong hover:bg-surface-muted hover:text-heading"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
              <div className="mt-2 flex flex-col gap-2">
                {account ? null : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-muted-foreground/25 px-4 py-2 text-center text-sm font-medium text-heading"
                  >
                    Log in
                  </Link>
                )}
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  style={{ boxShadow: SHADOW_RAISED }}
                  className="rounded-full bg-cta px-4 py-2 text-center text-sm font-semibold text-cta-foreground"
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
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-medium text-heading outline-none transition-colors duration-150 hover:bg-primary-subtle hover:text-primary-subtle-foreground focus-visible:ring-2 focus-visible:ring-ring/50";

function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex shrink-0 items-center gap-0.5">
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
