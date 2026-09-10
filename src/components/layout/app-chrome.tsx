"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { navByRole, type Role } from "@/lib/nav-config";

/** Client shim: nav items + container width are derived here (icons are functions
 * and can't cross the server→client boundary); identity comes from the server. */
export function AppChrome({
  role,
  who,
  children,
}: {
  role: Role;
  who: string;
  children: React.ReactNode;
}) {
  const p = usePathname();
  const wide = p.startsWith("/admin") || p.startsWith("/doctor/queue");
  return (
    <AppShell
      items={navByRole[role]}
      who={who}
      containerSize={wide ? "wide" : "content"}
      sidebar={role !== "patient"}
    >
      {children}
    </AppShell>
  );
}
