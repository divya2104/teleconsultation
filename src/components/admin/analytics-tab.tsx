"use client";

import { useState } from "react";
import { Tile } from "@/components/common/tile";
import { TrendChart } from "@/components/admin/trend-chart";
import {
  bookingsSeries,
  revenueSeries,
  noShowSeries,
  sliceDays,
  analyticsKpis,
} from "@/lib/mock/admin";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

const inr = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

export function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const k = analyticsKpis(days);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="flex gap-1 rounded-[--radius-md] border border-border bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-[--radius-sm] px-3 py-1.5 text-sm font-medium transition-colors",
                days === r.days
                  ? "bg-primary-subtle text-primary-subtle-foreground"
                  : "text-muted-foreground hover:text-heading",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tile label="Bookings" value={k.bookings} />
        <Tile label="Revenue" value={inr(k.revenue)} />
        <Tile label="Completion" value={`${k.completionRate}%`} />
        <Tile label="No-show rate" value={`${k.noShowRate}%`} />
        <Tile label="Recall → rebook" value={`${k.rebooking}%`} />
      </div>

      <ChartCard title="Bookings per day">
        <TrendChart data={sliceDays(bookingsSeries, days)} />
      </ChartCard>

      <ChartCard title="Revenue per day">
        <TrendChart
          data={sliceDays(revenueSeries, days)}
          format={(n) => inr(n)}
        />
      </ChartCard>

      <ChartCard title="No-shows per day">
        <TrendChart
          data={sliceDays(noShowSeries, days)}
          variant="bar"
          color="var(--triage-review)"
        />
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
