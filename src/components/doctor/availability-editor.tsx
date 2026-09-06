"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DAYS,
  defaultAvailability,
  type DayKey,
  type Range,
} from "@/lib/mock/doctor";

const SLOT_MIN = 20;

function countSlots(ranges: Range[]) {
  return ranges.reduce((n, r) => {
    const [sh, sm] = r.start.split(":").map(Number);
    const [eh, em] = r.end.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    return n + Math.max(0, Math.floor(mins / SLOT_MIN));
  }, 0);
}

export function AvailabilityEditor() {
  const [avail, setAvail] = useState<Record<DayKey, Range[]>>(
    () => structuredClone(defaultAvailability),
  );
  const [dirty, setDirty] = useState(false);

  const update = (fn: (a: Record<DayKey, Range[]>) => void) => {
    setAvail((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  };

  const weeklySlots = DAYS.reduce((n, d) => n + countSlots(avail[d.key]), 0);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <PageHeader
        title="Availability"
        description={`Slots are ${SLOT_MIN} minutes. Bookings only land in the windows you open.`}
      />

      <div className="flex flex-col gap-3">
        {DAYS.map((d) => (
          <div
            key={d.key}
            className="rounded-[--radius-lg] border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-heading">{d.label}</p>
              <span className="font-mono text-xs text-muted-foreground">
                {countSlots(avail[d.key])} slots
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {avail[d.key].length === 0 ? (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              ) : (
                avail[d.key].map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={r.start}
                      onChange={(e) =>
                        update((a) => {
                          a[d.key][i].start = e.target.value;
                        })
                      }
                      className="h-9 rounded-[--radius-sm] border border-input bg-surface px-2 font-mono text-sm"
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      type="time"
                      value={r.end}
                      onChange={(e) =>
                        update((a) => {
                          a[d.key][i].end = e.target.value;
                        })
                      }
                      className="h-9 rounded-[--radius-sm] border border-input bg-surface px-2 font-mono text-sm"
                    />
                    <button
                      onClick={() =>
                        update((a) => {
                          a[d.key].splice(i, 1);
                        })
                      }
                      className="grid size-8 place-items-center rounded-[--radius-sm] text-muted-foreground hover:bg-surface-muted hover:text-heading"
                      aria-label="Remove window"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))
              )}
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() =>
                  update((a) => {
                    a[d.key].push({ start: "10:00", end: "13:00" });
                  })
                }
              >
                <Plus className="size-4" />
                Add window
              </Button>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-[--radius-lg] border border-border bg-surface p-4">
        <p className="text-sm font-medium text-heading">Date overrides</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Block specific dates or add one-off availability. Full calendar picker
          comes with the backend.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => toast("Override editor — coming with backend")}>
          Block a date
        </Button>
      </section>

      <p className="text-sm text-muted-foreground">
        This produces roughly{" "}
        <span className="font-mono text-foreground">{weeklySlots}</span> bookable
        slots per week.
      </p>

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <span className="text-sm text-muted-foreground">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <Button
            disabled={!dirty}
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
            onClick={() => {
              setDirty(false);
              toast.success("Availability saved");
            }}
          >
            Save availability
          </Button>
        </div>
      </div>
    </div>
  );
}
