"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/common/logo";
import type { NavItem } from "@/lib/nav-config";
import { signOut } from "@/lib/db/client-api";
import { cn } from "@/lib/utils";

export function AppSidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("tab")
    ? `${pathname}?tab=${params.get("tab")}`
    : pathname;

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Section">
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          current === href ||
          (!href.includes("?") && pathname === href) ||
          (href.includes("?tab=") && current === href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[--radius-md] px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-heading",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Logo />
      </div>
      <AppSidebarNav items={items} />
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-[--radius-md] px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-heading"
        >
          <LogOut className="size-[18px]" strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
