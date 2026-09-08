"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Languages,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookableDoctor as Doctor } from "@/lib/db/client-api";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function slotsByDay(slots: string[]) {
  const m = new Map<string, string[]>();
  for (const s of slots) {
    const k = isoDay(new Date(s));
    m.set(k, [...(m.get(k) ?? []), s]);
  }
  return m;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export function DoctorSlotPicker({
  doctors,
  doctorId,
  slot,
  onSelectDoctor,
  onSelectSlot,
  onBack,
  onNext,
}: {
  doctors: Doctor[];
  doctorId: string;
  slot: string;
  onSelectDoctor: (id: string) => void;
  onSelectSlot: (iso: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [activeDay, setActiveDay] = useState("");

  // Land on the first doctor so the schedule pane is never empty.
  useEffect(() => {
    if (!doctorId && doctors[0]) onSelectDoctor(doctors[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = doctors.find((d) => d.id === doctorId) ?? doctors[0];
  const byDay = useMemo(() => slotsByDay(selected?.slots ?? []), [selected]);
  const availableDays = useMemo(() => [...byDay.keys()].sort(), [byDay]);

  // Reset the visible day whenever the doctor changes.
  useEffect(() => {
    setActiveDay(slot ? isoDay(new Date(slot)) : (availableDays[0] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const q = query.trim().toLowerCase();
  const filtered = doctors.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q),
  );

  const daySlots = activeDay ? (byDay.get(activeDay) ?? []) : [];

  // Month grid (Monday-first).
  const y = viewMonth.getFullYear();
  const mo = viewMonth.getMonth();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const today = isoDay(new Date());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pt-5 sm:px-6">
        <h1 className="text-xl sm:text-2xl">Choose a doctor and time</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All doctors are registered ophthalmologists.
        </p>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 pb-4 sm:px-6 lg:grid-cols-[2fr_3fr] lg:overflow-hidden">
        {/* Doctor list */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or specialty…"
              className="pl-9"
            />
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filtered.map((d) => {
              const active = d.id === doctorId;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectDoctor(d.id);
                    onSelectSlot("");
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary-subtle"
                      : "border-border bg-surface hover:bg-surface-muted",
                  )}
                >
                  <span className="relative shrink-0">
                    <DocAvatar doctor={d} className="size-11" />
                    {active ? (
                      <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border-2 border-[var(--primary-subtle)] bg-primary text-primary-foreground">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-sm font-semibold text-heading">
                      {d.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {d.specialty}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Languages className="size-3 shrink-0" />
                      <span className="truncate">
                        {d.languages.join(" · ")}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                No doctors match “{query}”.
              </p>
            ) : null}
          </div>
        </div>

        {/* Schedule */}
        <div className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto">
          {selected ? <DoctorBanner doctor={selected} /> : null}

          <div
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMonth(new Date(y, mo - 1, 1))}
                aria-label="Previous month"
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted"
              >
                <ChevronLeft className="size-4" />
              </button>
              <p className="font-heading text-sm font-semibold text-heading">
                {viewMonth.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                onClick={() => setViewMonth(new Date(y, mo + 1, 1))}
                aria-label="Next month"
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <span key={i} />;
                const key = isoDay(new Date(y, mo, day));
                const isAvail = byDay.has(key);
                const isActive = key === activeDay;
                const isToday = key === today;
                return (
                  <button
                    key={i}
                    disabled={!isAvail}
                    onClick={() => {
                      setActiveDay(key);
                      onSelectSlot("");
                    }}
                    className={cn(
                      "mx-auto grid size-8 place-items-center rounded-full border border-transparent text-xs tabular-nums transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive &&
                        isAvail &&
                        "bg-primary-subtle text-primary-subtle-foreground",
                      !isActive && !isAvail && "text-muted-foreground",
                      !isActive && isToday && "border-primary",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary-subtle" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border border-border" />
                Unavailable
              </span>
            </div>

            {activeDay ? (
              <>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {new Date(activeDay).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {daySlots.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSelectSlot(s)}
                      className={cn(
                        "rounded-[var(--radius-sm)] border py-2 text-center font-mono text-sm tabular-nums transition-colors",
                        s === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-primary-subtle",
                      )}
                    >
                      {fmtTime(s)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Select an available date to see times.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-surface px-5 py-3 sm:px-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!doctorId || !slot}
          className="bg-cta text-cta-foreground hover:bg-cta-hover"
        >
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DocAvatar({
  doctor,
  className,
}: {
  doctor: Doctor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-subtle font-heading text-sm font-semibold text-primary-subtle-foreground",
        className,
      )}
    >
      {doctor.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doctor.photo}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        initials(doctor.name)
      )}
    </span>
  );
}

function DoctorBanner({ doctor }: { doctor: Doctor }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-border-brand"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="absolute inset-0 bg-primary" />
      {doctor.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doctor.photo}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/15">
          <ImageIcon className="size-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-heading/45" />
      <div className="relative flex items-center gap-3 p-4 sm:p-5">
        <DocAvatar
          doctor={doctor}
          className="size-14 border-2 border-white/30"
        />
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold text-white">
            {doctor.name}
          </p>
          <p className="truncate text-sm text-white/70">{doctor.specialty}</p>
        </div>
      </div>
    </div>
  );
}
