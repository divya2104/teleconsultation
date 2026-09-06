"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { applications, directory, type Application } from "@/lib/mock/admin";
import { fmtDate } from "@/lib/mock/patient";
import { cn } from "@/lib/utils";

export function DoctorsTab() {
  const [queue, setQueue] = useState(applications);
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(directory.map((d) => [d.id, d.active])),
  );

  const decide = (app: Application, approved: boolean) => {
    setQueue((q) => q.filter((a) => a.id !== app.id));
    toast[approved ? "success" : "message"](
      `${app.name} ${approved ? "approved" : "rejected"}`,
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
          Verification queue ({queue.length})
        </h2>
        {queue.length ? (
          <ul className="divide-y divide-border overflow-hidden rounded-[--radius-lg] border border-border bg-surface">
            {queue.map((app) => (
              <li key={app.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-heading">{app.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {app.regNo} · {app.specialty} · submitted {fmtDate(app.submitted)}
                  </p>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col">
                    <SheetHeader>
                      <SheetTitle>{app.name}</SheetTitle>
                      <SheetDescription>
                        {app.specialty} · Reg. no. {app.regNo}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Submitted documents
                      </p>
                      <ul className="mt-2 flex flex-col gap-2">
                        {app.docs.map((d) => (
                          <li
                            key={d}
                            className="flex items-center gap-2 rounded-[--radius-md] border border-border p-3 text-sm"
                          >
                            <FileText className="size-4 text-muted-foreground" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Verify the registration number against the state medical
                        council record before approving.
                      </p>
                    </div>
                    <SheetFooter className="flex-row gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => decide(app, false)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="flex-1 bg-cta text-cta-foreground hover:bg-cta-hover"
                        onClick={() => decide(app, true)}
                      >
                        Approve
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Queue is clear.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
          Directory
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-[--radius-lg] border border-border bg-surface">
          {directory.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-heading">
                  {d.name}
                  {d.status === "verified" ? (
                    <BadgeCheck className="size-4 text-triage-normal" strokeWidth={2.5} />
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.specialty} · {d.consults30d} consults / 30d
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className={cn("text-xs", active[d.id] ? "text-triage-normal-fg" : "text-muted-foreground")}>
                  {active[d.id] ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={active[d.id]}
                  onCheckedChange={(v) => {
                    setActive((a) => ({ ...a, [d.id]: v }));
                    toast(`${d.name} ${v ? "activated" : "deactivated"}`);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
