"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { signOut } from "@/lib/db/client-api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebarNav } from "@/components/layout/app-sidebar";
import type { NavItem } from "@/lib/nav-config";

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

export function AppTopbar({
  items,
  who = "Signed in",
  standalone = false,
}: {
  items: NavItem[];
  who?: string;
  /** No left sidebar — keep the nav toggle + logo visible at every width. */
  standalone?: boolean;
}) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={standalone ? "" : "lg:hidden"}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[248px] p-0">
          <SheetHeader className="h-14 justify-center border-b border-border px-4">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <AppSidebarNav items={items} />
        </SheetContent>
      </Sheet>

      <div className={standalone ? "" : "lg:hidden"}>
        <Logo size="sm" />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NotificationsMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 outline-none transition-colors hover:bg-surface-muted focus-visible:ring-3 focus-visible:ring-ring/50">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initialsOf(who)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-heading sm:block">
                {who}
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">
                Signed in as
              </span>
              <span className="block truncate text-sm font-medium text-heading">
                {who}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
      </div>
    </header>
  );
}
