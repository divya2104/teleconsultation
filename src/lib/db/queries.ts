import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TriageState } from "@/components/common/triage-badge";
import type {
  Appointment,
  ApptStatus,
  PatientProfile,
} from "@/lib/mock/patient";
import {
  DAYS,
  type QueueItem,
  type TriageRecord,
  type DayKey,
  type Range,
} from "@/lib/mock/doctor";
import { QUESTIONS } from "@/lib/mock/intake";
import type { Json } from "@/lib/database.types";

/* ---------- mappers ---------- */

export function urgencyToTriage(u: number | null | undefined): TriageState {
  if (u == null) return "normal";
  return u >= 3 ? "urgent" : u >= 1 ? "review" : "normal";
}

const statusMap: Record<string, ApptStatus> = {
  upcoming: "upcoming",
  live: "live",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no-show",
};

function initialsOf(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** answers jsonb -> [{ q, a }] using the question/option labels (content, not data). */
function answersToQnA(answers: Json): { q: string; a: string }[] {
  const obj = (answers ?? {}) as Record<string, string | string[]>;
  const out: { q: string; a: string }[] = [];
  for (const q of QUESTIONS) {
    const raw = obj[q.id];
    if (raw == null || (Array.isArray(raw) && raw.length === 0)) continue;
    const label = (v: string) =>
      q.options?.find((o) => o.value === v)?.label ?? v;
    const a = Array.isArray(raw)
      ? raw.map(label).join(", ")
      : q.type === "text"
        ? raw
        : label(raw);
    out.push({ q: q.text, a });
  }
  return out;
}

/* ---------- row shapes for embedded selects (hand types regenerate later) ---------- */

type ApptRow = {
  id: string;
  starts_at: string;
  status: string;
  reason: string | null;
  symptom?: string | null;
  payment_status?: string;
  doctors: { name: string; specialty: string } | null;
  profiles?: { full_name: string | null } | null;
  triage_records:
    | {
        urgency: number;
        answers?: Json;
        acuity?: Json;
        photo_paths?: string[];
        red_flags?: string[];
      }
    | null;
};

const one = <T>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

function toAppointment(row: ApptRow): Appointment {
  const doc = one(row.doctors);
  const tr = one(row.triage_records);
  return {
    id: row.id,
    doctorName: doc?.name ?? "",
    doctorSpecialty: doc?.specialty ?? "Ophthalmology",
    start: row.starts_at,
    status: statusMap[row.status] ?? "upcoming",
    triage: urgencyToTriage(tr?.urgency),
    reason: row.reason ?? "",
    intakeComplete: !!tr,
  };
}

/* ---------- profile ---------- */

export async function getMyProfile(): Promise<PatientProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  return {
    name: data.full_name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? user.email ?? "",
    diabetes: data.diabetes,
    notify: {
      whatsapp: data.notify_whatsapp,
      sms: data.notify_sms,
      email: data.notify_email,
    },
    consents: [], // TODO(mock): consent ledger is a backend follow-up
  };
}

/* ---------- patient: appointments ---------- */

export async function myAppointments(): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, status, reason, doctors(name, specialty), triage_records(urgency)",
    )
    .order("starts_at", { ascending: false })
    .returns<ApptRow[]>();
  return (data ?? []).map(toAppointment);
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, status, reason, doctors(name, specialty), triage_records(urgency)",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<ApptRow | null>();
  return data ? toAppointment(data) : null;
}

/* ---------- doctor: availability ---------- */

export async function getMyAvailability(): Promise<
  Record<DayKey, Range[]>
> {
  const empty: Record<DayKey, Range[]> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;
  const { data: doc } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!doc) return empty;
  const { data: rows } = await supabase
    .from("availability")
    .select("weekday, start_time, end_time")
    .eq("doctor_id", doc.id)
    .order("weekday")
    .order("start_time");
  for (const r of rows ?? []) {
    const key = DAYS[r.weekday - 1]?.key;
    if (key)
      empty[key].push({
        start: r.start_time.slice(0, 5),
        end: r.end_time.slice(0, 5),
      });
  }
  return empty;
}

/* ---------- doctor: queue + consult ---------- */

export async function doctorQueue(): Promise<QueueItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, status, reason, symptom, payment_status, profiles(full_name), triage_records(urgency, answers)",
    )
    .order("starts_at", { ascending: true })
    .returns<ApptRow[]>();

  return (data ?? []).map((row) => {
    const p = one(row.profiles);
    const tr = one(row.triage_records);
    const name = p?.full_name ?? "Patient";
    return {
      id: row.id,
      patientInitials: initialsOf(name),
      patientName: name,
      age: 0, // TODO(mock): DOB not captured in the core slice
      slot: row.starts_at,
      status:
        row.status === "no_show"
          ? "no-show"
          : (row.status as QueueItem["status"]),
      triage: urgencyToTriage(tr?.urgency),
      summary: row.symptom || row.reason || "—",
      urgency: (tr?.urgency ?? 1) as 0 | 1 | 2 | 3,
      paid: row.payment_status === "paid",
      inconclusiveAI: false, // TODO(mock): photo AI is a follow-up
    };
  });
}

export async function getTriageForConsult(
  appointmentId: string,
): Promise<{ record: TriageRecord; photoUrls: string[] } | null> {
  const supabase = await createClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select(
      "id, reason, symptom, profiles(full_name), triage_records(answers, acuity, photo_paths, urgency, red_flags)",
    )
    .eq("id", appointmentId)
    .maybeSingle()
    .returns<ApptRow | null>();
  if (!appt) return null;

  const p = one(appt.profiles);
  const tr = one(appt.triage_records);
  const acuity = (tr?.acuity ?? {}) as { right?: string; left?: string };
  const paths = tr?.photo_paths ?? [];

  let photoUrls: string[] = [];
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from("intake-photos")
      .createSignedUrls(paths, 60 * 30);
    photoUrls = (signed ?? [])
      .map((s) => s.signedUrl)
      .filter((u): u is string => !!u);
  }

  return {
    photoUrls,
    record: {
      appointmentId,
      patientName: p?.full_name ?? "Patient",
      age: 0,
      reason: appt.reason ?? appt.symptom ?? "—",
      urgency: (tr?.urgency ?? 1) as 0 | 1 | 2 | 3,
      redFlags: tr?.red_flags ?? [],
      acuity: { right: acuity.right ?? "—", left: acuity.left ?? "—" },
      questionnaire: answersToQnA(tr?.answers ?? {}),
      photoNotes: paths.length
        ? [`${paths.length} screening photo(s) attached`]
        : ["No photos submitted"],
      pastAppointments: [], // TODO(mock): history aggregation is a follow-up
    },
  };
}
