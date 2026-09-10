import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { Container } from "@/components/layout/container";
import type { NavItem } from "@/lib/nav-config";

export function AppShell({
  items,
  who,
  containerSize = "content",
  sidebar = true,
  children,
}: {
  items: NavItem[];
  who?: string;
  containerSize?: "content" | "wide";
  /** Show the fixed left sidebar (lg+). When false, all nav lives in the topbar. */
  sidebar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      {sidebar ? (
        <Suspense fallback={null}>
          <AppSidebar items={items} />
        </Suspense>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-14 border-b border-border" />}>
          <AppTopbar items={items} who={who} standalone={!sidebar} />
        </Suspense>
        <main className="flex-1 py-6 md:py-8">
          <Container size={containerSize}>{children}</Container>
        </main>
      </div>
    </div>
  );
}
