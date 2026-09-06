"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { patientNav, doctorNav, adminNav } from "@/lib/nav-config";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = usePathname();
  const isDoctor = p.startsWith("/doctor");
  const isAdmin = p.startsWith("/admin");

  const items = isDoctor ? doctorNav : isAdmin ? adminNav : patientNav;
  const who = isDoctor
    ? "Dr. Anand Rao"
    : isAdmin
      ? "Admin — Ops"
      : "Priya Sharma";
  const wide = isAdmin || p.startsWith("/doctor/queue");

  return (
    <AppShell items={items} who={who} containerSize={wide ? "wide" : "content"}>
      {children}
    </AppShell>
  );
}
