export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  regNo: string;
  bio: string;
  /** optional headshot / clinic image — falls back to an initials avatar */
  photo?: string;
  /** ISO datetimes, next available slots */
  slots: string[];
};

// Slots are generated relative to "now" so the picker always has future times.
function slotsFrom(dayOffsets: number[], hours: number[]): string[] {
  const out: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (const d of dayOffsets) {
    for (const h of hours) {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + d);
      dt.setHours(h, 0, 0, 0);
      out.push(dt.toISOString());
    }
  }
  return out;
}

export const doctors: Doctor[] = [
  {
    id: "doc_rao",
    name: "Dr. Anand Rao",
    specialty: "General ophthalmology",
    languages: ["English", "Hindi", "Kannada"],
    regNo: "KMC/12345",
    bio: "18 years in comprehensive eye care. Special interest in dry eye and anterior segment.",
    slots: slotsFrom([1, 2, 3], [10, 11, 15, 16]),
  },
  {
    id: "doc_iyer",
    name: "Dr. Meera Iyer",
    specialty: "Cornea & refractive",
    languages: ["English", "Tamil", "Hindi"],
    regNo: "TNMC/54321",
    bio: "Cornea specialist. Sees a high volume of contact-lens and refractive concerns.",
    slots: slotsFrom([1, 2, 4], [9, 12, 13, 18]),
  },
  {
    id: "doc_qureshi",
    name: "Dr. Sana Qureshi",
    specialty: "Glaucoma & general",
    languages: ["English", "Hindi", "Urdu"],
    regNo: "MMC/98765",
    bio: "Glaucoma and general ophthalmology. Focus on early detection and long-term follow-up.",
    slots: slotsFrom([2, 3, 5], [10, 14, 17]),
  },
  {
    id: "doc_patel",
    name: "Dr. Raj Patel",
    specialty: "Paediatric ophthalmology",
    languages: ["English", "Gujarati", "Hindi"],
    regNo: "GMC/44556",
    bio: "Paediatric eye care — squint, amblyopia and childhood refractive problems.",
    slots: slotsFrom([1, 3, 4], [10, 11, 15, 16]),
  },
  {
    id: "doc_sharma",
    name: "Dr. Priya Sharma",
    specialty: "Retina & vitreous",
    languages: ["English", "Hindi", "Punjabi"],
    regNo: "PMC/77889",
    bio: "Medical and surgical retina, with a focus on diabetic eye disease.",
    slots: slotsFrom([2, 4, 5], [9, 12, 16]),
  },
  {
    id: "doc_singh",
    name: "Dr. Vikram Singh",
    specialty: "Oculoplastics",
    languages: ["English", "Hindi"],
    regNo: "DMC/33221",
    bio: "Eyelid, tear-duct and orbit surgery; also sees general adult eye complaints.",
    slots: slotsFrom([1, 2, 5], [10, 14, 17]),
  },
];

export const CONSULT_PRICE = 499;

export function fmtSlot(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function groupSlotsByDay(slots: string[]) {
  const map = new Map<string, string[]>();
  for (const s of slots) {
    const key = new Date(s).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    map.set(key, [...(map.get(key) ?? []), s]);
  }
  return [...map.entries()];
}
