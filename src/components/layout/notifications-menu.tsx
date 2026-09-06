"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications as seed } from "@/lib/mock/notifications";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-surface" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold text-heading">Notifications</span>
          {unread > 0 ? (
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => setItems((list) => list.map((n) => ({ ...n, unread: false })))}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        {items.length ? (
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex gap-3 px-3 py-2.5 hover:bg-surface-muted"
                  onClick={() =>
                    setItems((list) =>
                      list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
                    )
                  }
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.unread ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-heading">
                        {n.title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {n.ago}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {n.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
