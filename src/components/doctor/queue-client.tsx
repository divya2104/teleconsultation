"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { QueueRow } from "@/components/doctor/queue-row";
import { EmptyState } from "@/components/common/empty-state";
import { ListChecks } from "lucide-react";
import type { QueueItem } from "@/lib/mock/doctor";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past-due", label: "Past-due" },
  { key: "completed", label: "Completed" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

export function QueueClient({ items }: { items: QueueItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("upcoming");
  const [q, setQ] = useState("");
  const [now] = useState(() => Date.now());

  const rows = useMemo(() => {
    return items
      .filter((item) => {
        if (filter === "completed") return item.status === "completed" || item.status === "no-show";
        if (filter === "past-due")
          return item.status === "upcoming" && +new Date(item.slot) < now;
        return item.status === "upcoming" || item.status === "live";
      })
      .filter((item) =>
        q ? item.patientName.toLowerCase().includes(q.toLowerCase()) : true,
      )
      .sort((a, b) => +new Date(a.slot) - +new Date(b.slot));
  }, [items, filter, q, now]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Consult queue"
        description="Every consult across your schedule."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-[--radius-md] border border-border bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-[--radius-sm] px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary-subtle text-primary-subtle-foreground"
                  : "text-muted-foreground hover:text-heading",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search patient"
          className="sm:max-w-xs"
        />
      </div>

      {rows.length ? (
        <div className="flex flex-col gap-3">
          {rows.map((item) => (
            <QueueRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState icon={ListChecks} title="Nothing here" hint="Try a different filter." />
      )}
    </div>
  );
}
