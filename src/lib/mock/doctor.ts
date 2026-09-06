import type { TriageState } from "@/components/common/triage-badge";

export type QueueItem = {
  id: string;
  patientInitials: string;
  patientName: string;
  age: number;
  slot: string; // ISO
  status: "upcoming" | "live" | "completed" | "no-show";
  triage: TriageState;
  summary: string;
  urgency: 0 | 1 | 2 | 3;
  paid: boolean;
  inconclusiveAI: boolean;
};

function at(dayOffset: number, h: number, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const queue: QueueItem[] = [
  {
    id: "apt_2041",
    patientInitials: "RM",
    patientName: "R. Mehta",
    age: 41,
    slot: at(0, 10, 30),
    status: "upcoming",
    triage: "review",
    summary: "Blurred vision 4 days, mild redness right eye on photo screen",
    urgency: 2,
    paid: true,
    inconclusiveAI: false,
  },
  {
    id: "apt_2044",
    patientInitials: "SK",
    patientName: "S. Kapoor",
    age: 63,
    slot: at(0, 11, 0),
    status: "upcoming",
    triage: "urgent",
    summary: "New flashes and floaters, left eye — red flag",
    urgency: 3,
    paid: true,
    inconclusiveAI: false,
  },
  {
    id: "apt_2047",
    patientInitials: "AV",
    patientName: "A. Verma",
    age: 29,
    slot: at(0, 12, 0),
    status: "upcoming",
    triage: "normal",
    summary: "Itching, watering — likely allergic",
    urgency: 0,
    paid: true,
    inconclusiveAI: false,
  },
  {
    id: "apt_2050",
    patientInitials: "PN",
    patientName: "P. Nair",
    age: 55,
    slot: at(0, 15, 0),
    status: "upcoming",
    triage: "review",
    summary: "Gradual blur, reads 6/18 both eyes — photo screen inconclusive",
    urgency: 1,
    paid: true,
    inconclusiveAI: true,
  },
  {
    id: "apt_2038",
    patientInitials: "TG",
    patientName: "T. Gupta",
    age: 47,
    slot: at(-1, 16, 30),
    status: "completed",
    triage: "normal",
    summary: "Dry eye follow-up",
    urgency: 0,
    paid: true,
    inconclusiveAI: false,
  },
  {
    id: "apt_2033",
    patientInitials: "MJ",
    patientName: "M. Joshi",
    age: 38,
    slot: at(-2, 9, 0),
    status: "no-show",
    triage: "normal",
    summary: "Eye strain",
    urgency: 0,
    paid: true,
    inconclusiveAI: false,
  },
];

export const todayTiles = () => {
  const today = queue.filter(
    (q) => new Date(q.slot).toDateString() === new Date().toDateString(),
  );
  return {
    scheduled: today.length,
    completed: today.filter((q) => q.status === "completed").length,
    noShows: queue.filter((q) => q.status === "no-show").length,
    nextInMin: (() => {
      const upcoming = today
        .filter((q) => q.status === "upcoming")
        .sort((a, b) => +new Date(a.slot) - +new Date(b.slot))[0];
      if (!upcoming) return null;
      return Math.max(0, Math.round((+new Date(upcoming.slot) - Date.now()) / 60000));
    })(),
  };
};

// ---- consult room triage record ----
export type TriageRecord = {
  appointmentId: string;
  patientName: string;
  age: number;
  reason: string;
  urgency: 0 | 1 | 2 | 3;
  redFlags: string[];
  acuity: { right: string; left: string };
  questionnaire: { q: string; a: string }[];
  photoNotes: string[];
  pastAppointments: { date: string; diagnosis: string }[];
};

export const triageRecords: Record<string, TriageRecord> = {
  apt_2041: {
    appointmentId: "apt_2041",
    patientName: "R. Mehta",
    age: 41,
    reason: "Blurred vision, 4 days",
    urgency: 2,
    redFlags: [],
    acuity: { right: "6/12", left: "6/9" },
    questionnaire: [
      { q: "When did it start?", a: "In the last few days" },
      { q: "Symptoms", a: "Blurred vision, redness" },
      { q: "Which eye?", a: "Right" },
      { q: "Contact lenses?", a: "No" },
    ],
    photoNotes: [
      "Mild conjunctival redness, right eye (screening aid)",
      "No obvious corneal opacity",
      "Lids appear normal",
    ],
    pastAppointments: [
      { date: "2026-07-02", diagnosis: "Allergic conjunctivitis" },
    ],
  },
};

export function getTriage(id: string): TriageRecord {
  return (
    triageRecords[id] ?? {
      appointmentId: id,
      patientName: queue.find((q) => q.id === id)?.patientName ?? "Patient",
      age: queue.find((q) => q.id === id)?.age ?? 40,
      reason: queue.find((q) => q.id === id)?.summary ?? "—",
      urgency: queue.find((q) => q.id === id)?.urgency ?? 1,
      redFlags: [],
      acuity: { right: "6/9", left: "6/9" },
      questionnaire: [{ q: "Symptoms", a: queue.find((q) => q.id === id)?.summary ?? "—" }],
      photoNotes: ["Screening images attached"],
      pastAppointments: [],
    }
  );
}

// ---- patients roster ----
export type PatientRow = {
  id: string;
  name: string;
  age: number;
  lastSeen: string;
  flags: string[];
};

export const patients: PatientRow[] = [
  { id: "pt_mehta", name: "R. Mehta", age: 41, lastSeen: "2026-07-02", flags: ["Diabetes"] },
  { id: "pt_gupta", name: "T. Gupta", age: 47, lastSeen: "2026-09-05", flags: [] },
  { id: "pt_nair", name: "P. Nair", age: 55, lastSeen: "2026-06-11", flags: ["Diabetes", "Glaucoma suspect"] },
  { id: "pt_verma", name: "A. Verma", age: 29, lastSeen: "2026-08-20", flags: [] },
];

export const patientHistory: Record<
  string,
  { date: string; diagnosis: string; prescriptionId?: string }[]
> = {
  pt_mehta: [
    { date: "2026-07-02", diagnosis: "Allergic conjunctivitis", prescriptionId: "rx_5521" },
    { date: "2026-02-18", diagnosis: "Refractive error — new prescription" },
  ],
  pt_nair: [
    { date: "2026-06-11", diagnosis: "Early cataract, both eyes — monitor" },
  ],
};

// ---- availability ----
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export type Range = { start: string; end: string };
export const defaultAvailability: Record<DayKey, Range[]> = {
  mon: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "18:00" }],
  tue: [{ start: "10:00", end: "13:00" }],
  wed: [{ start: "15:00", end: "18:00" }],
  thu: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "18:00" }],
  fri: [{ start: "10:00", end: "13:00" }],
  sat: [],
  sun: [],
};
