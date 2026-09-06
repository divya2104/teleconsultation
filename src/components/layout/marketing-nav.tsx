"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, CalendarPlus } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNav, forDoctorsMenu } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const place = () => {
      const nav = navRef.current;
      if (!nav || !brandRef.current || !actionRef.current) return;
      const n = nav.getBoundingClientRect();
      const b = brandRef.current.getBoundingClientRect();
      const a = actionRef.current.getBoundingClientRect();
      nav.style.setProperty("--logo-x", `${b.right - n.left + 14}px`);
      nav.style.setProperty("--action-x", `${a.left - n.left - 14}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  return (
    <header
      ref={navRef}
      data-notched
      className={cn(
        "nav-notched sticky top-0 z-40 h-16 transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-border bg-surface/85 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-full max-w-[var(--container-content)] items-center gap-4 px-4 md:px-6 lg:px-8"
        aria-label="Primary"
      >
        <div ref={brandRef}>
          <Logo />
        </div>

        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          <NavLink href="/how-it-works" active={pathname === "/how-it-works"}>
            How it works
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-[--radius-md] px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-surface-muted hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-surface-muted data-[state=open]:text-heading">
                For doctors
                <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[300px] p-2">
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

          {marketingNav
            .filter((i) => i.href !== "/for-doctors" && i.href !== "/how-it-works")
            .map((i) => (
              <NavLink key={i.href} href={i.href} active={pathname === i.href}>
                {i.label}
              </NavLink>
            ))}
        </div>

        <div ref={actionRef} className="ml-auto flex items-center gap-2.5 md:ml-0">
          <Button variant="outline" asChild className="hidden h-9 sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="h-9 bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href="/book">
              <CalendarPlus className="size-4" />
              Book consult
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                <Link
                  href="/how-it-works"
                  className="rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-heading"
                >
                  How it works
                </Link>
                {marketingNav
                  .filter((i) => i.href !== "/how-it-works")
                  .map((i) => (
                    <Link
                      key={i.href}
                      href={i.href}
                      className="rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-heading"
                    >
                      {i.label}
                    </Link>
                  ))}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
                  <Link href="/book">Book consult</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-[--radius-md] px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "bg-primary-subtle text-primary-subtle-foreground ring-1 ring-border-brand"
          : "text-muted-foreground hover:bg-surface-muted hover:text-heading",
      )}
    >
      {children}
    </Link>
  );
}
