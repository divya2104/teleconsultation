import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { Container } from "@/components/layout/container";
import type { NavItem } from "@/lib/nav-config";

export function AppShell({
  items,
  who,
  containerSize = "content",
  children,
}: {
  items: NavItem[];
  who?: string;
  containerSize?: "content" | "wide";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <Suspense fallback={null}>
        <AppSidebar items={items} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-14 border-b border-border" />}>
          <AppTopbar items={items} who={who} />
        </Suspense>
        <main className="flex-1 py-6 md:py-8">
          <Container size={containerSize}>{children}</Container>
        </main>
      </div>
    </div>
  );
}
