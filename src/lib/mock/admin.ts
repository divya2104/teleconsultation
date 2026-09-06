export type Application = {
  id: string;
  name: string;
  regNo: string;
  specialty: string;
  submitted: string;
  docs: string[];
};

export const applications: Application[] = [
  {
    id: "app_01",
    name: "Dr. Neha Bansal",
    regNo: "DMC/33219",
    specialty: "Paediatric ophthalmology",
    submitted: "2026-09-03",
    docs: ["Medical registration certificate", "Government photo ID", "Specialty qualification"],
  },
  {
    id: "app_02",
    name: "Dr. Vikram Shetty",
    regNo: "KMC/77140",
    specialty: "Retina",
    submitted: "2026-09-05",
    docs: ["Medical registration certificate", "Government photo ID"],
  },
];

export type DoctorDirectoryRow = {
  id: string;
  name: string;
  specialty: string;
  status: "verified" | "pending" | "suspended";
  active: boolean;
  consults30d: number;
};

export const directory: DoctorDirectoryRow[] = [
  { id: "d1", name: "Dr. Anand Rao", specialty: "General ophthalmology", status: "verified", active: true, consults30d: 118 },
  { id: "d2", name: "Dr. Meera Iyer", specialty: "Cornea & refractive", status: "verified", active: true, consults30d: 96 },
  { id: "d3", name: "Dr. Sana Qureshi", specialty: "Glaucoma & general", status: "verified", active: false, consults30d: 0 },
];

export type BookingRow = {
  ref: string;
  patient: string;
  doctor: string;
  slot: string;
  status: "upcoming" | "completed" | "cancelled" | "no-show";
  payment: "paid" | "refunded" | "failed";
  triage: "normal" | "review" | "urgent";
};

export const bookings: BookingRow[] = [
  { ref: "CS-841002", patient: "R. Mehta", doctor: "Dr. Anand Rao", slot: "2026-09-08 10:30", status: "upcoming", payment: "paid", triage: "review" },
  { ref: "CS-840887", patient: "S. Kapoor", doctor: "Dr. Meera Iyer", slot: "2026-09-08 11:00", status: "upcoming", payment: "paid", triage: "urgent" },
  { ref: "CS-840651", patient: "T. Gupta", doctor: "Dr. Anand Rao", slot: "2026-09-05 16:30", status: "completed", payment: "paid", triage: "normal" },
  { ref: "CS-840322", patient: "M. Joshi", doctor: "Dr. Sana Qureshi", slot: "2026-09-04 09:00", status: "no-show", payment: "paid", triage: "normal" },
  { ref: "CS-840190", patient: "A. Verma", doctor: "Dr. Meera Iyer", slot: "2026-09-03 12:00", status: "cancelled", payment: "refunded", triage: "normal" },
];

export type Transaction = {
  id: string;
  ref: string;
  gatewayRef: string;
  amount: number;
  status: "captured" | "refunded" | "failed";
  date: string;
};

export const transactions: Transaction[] = [
  { id: "t1", ref: "CS-841002", gatewayRef: "pay_Nx8k2LmQ", amount: 499, status: "captured", date: "2026-09-06" },
  { id: "t2", ref: "CS-840887", gatewayRef: "pay_Nx7f1KpR", amount: 499, status: "captured", date: "2026-09-06" },
  { id: "t3", ref: "CS-840651", gatewayRef: "pay_Nx4c9JhT", amount: 499, status: "captured", date: "2026-09-05" },
  { id: "t4", ref: "CS-840190", gatewayRef: "pay_Nx2a7GfV", amount: 499, status: "refunded", date: "2026-09-03" },
  { id: "t5", ref: "CS-840055", gatewayRef: "pay_Nx1z5DdW", amount: 499, status: "failed", date: "2026-09-02" },
];

// ---- analytics time series (last 90 days, daily) ----
function series(base: number, spread: number, seed: number) {
  const days = 90;
  const out: { date: string; value: number }[] = [];
  let v = base;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // deterministic pseudo-random walk
    const r = Math.sin((i + seed) * 1.3) * 0.5 + Math.sin((i + seed) * 0.4) * 0.5;
    v = Math.max(0, Math.round(base + r * spread + (days - i) * (base * 0.01)));
    out.push({ date: d.toISOString().slice(0, 10), value: v });
  }
  return out;
}

export const bookingsSeries = series(14, 6, 1);
export const revenueSeries = bookingsSeries.map((d) => ({
  date: d.date,
  value: d.value * 499,
}));
export const noShowSeries = series(2, 2, 7).map((d) => ({
  date: d.date,
  value: Math.min(d.value, 5),
}));

export function sliceDays<T>(arr: T[], days: number): T[] {
  return arr.slice(Math.max(0, arr.length - days));
}

export function analyticsKpis(days: number) {
  const b = sliceDays(bookingsSeries, days);
  const r = sliceDays(revenueSeries, days);
  const n = sliceDays(noShowSeries, days);
  const totalBookings = b.reduce((s, d) => s + d.value, 0);
  const totalNoShows = n.reduce((s, d) => s + d.value, 0);
  return {
    bookings: totalBookings,
    revenue: r.reduce((s, d) => s + d.value, 0),
    noShowRate: totalBookings ? Math.round((totalNoShows / totalBookings) * 100) : 0,
    completionRate: totalBookings
      ? Math.round(((totalBookings - totalNoShows) / totalBookings) * 96)
      : 0,
    rebooking: 34,
  };
}
