"use client";

import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";
import { DAYS, type DayKey, type Range } from "@/lib/mock/doctor";

/** Doctor shape the booking picker consumes (open slots attached). */
export type BookableDoctor = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  photo?: string;
  slots: string[]; // ISO datetimes, currently open
};

export async function listDoctorsWithSlots(
  days = 14,
): Promise<BookableDoctor[]> {
  const supabase = createClient();
  const { data: docs, error } = await supabase
    .from("doctors")
    .select("id, name, specialty, languages, photo_url")
    .eq("active", true)
    .eq("verification_status", "verified")
    .order("name");
  if (error || !docs) return [];

  return Promise.all(
    docs.map(async (d) => {
      const { data: slots } = await supabase.rpc("open_slots", {
        p_doctor_id: d.id,
        p_days: days,
      });
      return {
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        languages: d.languages ?? [],
        photo: d.photo_url ?? undefined,
        slots: (slots ?? []) as string[],
      };
    }),
  );
}

export type AppointmentBrief = {
  id: string;
  ref: string;
  startsAt: string;
  doctorName: string;
  doctorSpecialty: string;
  intakeComplete: boolean;
};

type BriefRow = {
  id: string;
  ref: string;
  starts_at: string;
  doctors: { name: string; specialty: string } | null;
  triage_records: { id: string } | null;
};

export async function getAppointmentBrief(
  id: string,
): Promise<AppointmentBrief | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, ref, starts_at, doctors(name, specialty), triage_records(id)")
    .eq("id", id)
    .maybeSingle()
    .returns<BriefRow | null>();
  if (!data) return null;
  const doc = Array.isArray(data.doctors) ? data.doctors[0] : data.doctors;
  const tr = Array.isArray(data.triage_records)
    ? data.triage_records[0]
    : data.triage_records;
  return {
    id: data.id,
    ref: data.ref,
    startsAt: data.starts_at,
    doctorName: doc?.name ?? "",
    doctorSpecialty: doc?.specialty ?? "",
    intakeComplete: !!tr,
  };
}

export type BookResult =
  | { ok: true; id: string; ref: string }
  | { ok: false; error: string };

export async function bookAppointment(input: {
  doctorId: string;
  startsAt: string;
  reason: string;
  symptom?: string;
  note?: string;
}): Promise<BookResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("book_appointment", {
    p_doctor_id: input.doctorId,
    p_starts_at: input.startsAt,
    p_reason: input.reason,
    p_symptom: input.symptom,
    p_note: input.note,
  });
  if (error || !data) {
    const msg = error?.message ?? "";
    return {
      ok: false,
      error: msg.includes("slot not available")
        ? "That time was just taken — pick another slot."
        : msg.includes("not authenticated")
          ? "Your session expired — sign in again."
          : "Couldn't complete the booking. Please try again.",
    };
  }
  return { ok: true, id: data.id, ref: data.ref };
}

/** Uploads intake photos (data URLs or File) to storage; returns the object paths. */
export async function uploadIntakePhotos(
  appointmentId: string,
  photos: (string | File)[],
): Promise<string[]> {
  const supabase = createClient();
  const paths: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const blob =
      typeof p === "string" ? await (await fetch(p)).blob() : p;
    const path = `${appointmentId}/${i}.jpg`;
    const { error } = await supabase.storage
      .from("intake-photos")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (!error) paths.push(path);
  }
  return paths;
}

export async function submitTriage(input: {
  appointmentId: string;
  answers: Record<string, string | string[]>;
  acuity: { right: string; left: string; distanceOk?: boolean };
  photoPaths: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.rpc("submit_triage", {
    p_appointment_id: input.appointmentId,
    p_answers: input.answers as unknown as Json,
    p_acuity: input.acuity as unknown as Json,
    p_photo_paths: input.photoPaths,
  });
  if (error) {
    return {
      ok: false,
      error: error.message.includes("appointment not found")
        ? "We couldn't find that booking for your account."
        : "Couldn't submit the self-test. Please try again.",
    };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await createClient().auth.signOut();
}

/** Replace the caller's weekly availability windows. */
export async function saveMyAvailability(
  avail: Record<DayKey, Range[]>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: doc } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!doc) {
    return { ok: false, error: "No doctor profile — apply to practise first." };
  }

  const rows = DAYS.flatMap((d, i) =>
    (avail[d.key] ?? [])
      .filter((r) => r.start && r.end && r.end > r.start)
      .map((r) => ({
        doctor_id: doc.id,
        weekday: i + 1,
        start_time: r.start,
        end_time: r.end,
      })),
  );

  const del = await supabase
    .from("availability")
    .delete()
    .eq("doctor_id", doc.id);
  if (del.error) return { ok: false, error: del.error.message };
  if (rows.length) {
    const ins = await supabase.from("availability").insert(rows);
    if (ins.error) return { ok: false, error: ins.error.message };
  }
  return { ok: true };
}

export async function updateProfile(patch: {
  full_name?: string;
  phone?: string;
  diabetes?: "yes" | "no" | "unknown";
  notify_whatsapp?: boolean;
  notify_sms?: boolean;
  notify_email?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
