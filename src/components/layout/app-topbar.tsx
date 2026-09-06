"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/logo";
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

export function AppTopbar({
  items,
  who = "Signed in",
}: {
  items: NavItem[];
  who?: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
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

      <div className="lg:hidden">
        <Logo size="sm" />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NotificationsMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Avatar className="size-8">
                <AvatarFallback className="bg-surface-muted text-xs text-muted-foreground">
                  CS
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              {who}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
