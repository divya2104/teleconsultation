import type { TriageState } from "@/components/common/triage-badge";

export type ApptStatus =
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled"
  | "no-show";

export type Appointment = {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  start: string; // ISO
  status: ApptStatus;
  triage: TriageState;
  reason: string;
  intakeComplete: boolean;
  diagnosis?: string;
  prescriptionId?: string;
};

export type Prescription = {
  id: string;
  appointmentId: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medications: { name: string; dose: string; instructions: string }[];
  advice: string;
};

export type Recall = {
  id: string;
  reason: string;
  dueDate: string;
  status: "upcoming" | "due" | "done";
  fromAppointmentId: string;
};

export type PatientProfile = {
  name: string;
  phone: string;
  email: string;
  diabetes: "yes" | "no" | "unknown";
  notify: { whatsapp: boolean; sms: boolean; email: boolean };
  consents: { label: string; grantedAt: string }[];
};

export const appointments: Appointment[] = [
  {
    id: "apt_2041",
    doctorName: "Dr. Anand Rao",
    doctorSpecialty: "Ophthalmology",
    start: "2026-09-08T10:30:00+05:30",
    status: "upcoming",
    triage: "review",
    reason: "Blurred vision, 4 days",
    intakeComplete: true,
  },
  {
    id: "apt_1988",
    doctorName: "Dr. Meera Iyer",
    doctorSpecialty: "Ophthalmology",
    start: "2026-09-12T16:00:00+05:30",
    status: "upcoming",
    triage: "normal",
    reason: "Routine check, new glasses",
    intakeComplete: false,
  },
  {
    id: "apt_1743",
    doctorName: "Dr. Anand Rao",
    doctorSpecialty: "Ophthalmology",
    start: "2026-07-02T11:00:00+05:30",
    status: "completed",
    triage: "normal",
    reason: "Itchy, watering eyes",
    intakeComplete: true,
    diagnosis: "Allergic conjunctivitis",
    prescriptionId: "rx_5521",
  },
  {
    id: "apt_1610",
    doctorName: "Dr. Sana Qureshi",
    doctorSpecialty: "Ophthalmology",
    start: "2026-04-19T09:30:00+05:30",
    status: "no-show",
    triage: "normal",
    reason: "Eye strain",
    intakeComplete: true,
  },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx_5521",
    appointmentId: "apt_1743",
    date: "2026-07-02",
    doctorName: "Dr. Anand Rao",
    diagnosis: "Allergic conjunctivitis",
    medications: [
      {
        name: "Olopatadine 0.1% eye drops",
        dose: "1 drop, both eyes",
        instructions: "Twice daily for 2 weeks",
      },
      {
        name: "Carboxymethylcellulose 0.5%",
        dose: "1 drop, both eyes",
        instructions: "As needed, up to 4 times daily",
      },
    ],
    advice:
      "Avoid rubbing the eyes. Cold compress for comfort. Return sooner if pain or vision changes.",
  },
];

export const recalls: Recall[] = [
  {
    id: "rc_88",
    reason: "Diabetic retinopathy screening — reported diabetes",
    dueDate: "2026-10-05",
    status: "upcoming",
    fromAppointmentId: "apt_1743",
  },
];

export const patientProfile: PatientProfile = {
  name: "Priya Sharma",
  phone: "+91 98••• ••210",
  email: "priya.s••••@gmail.com",
  diabetes: "yes",
  notify: { whatsapp: true, sms: true, email: false },
  consents: [
    { label: "Photo & health data collection for triage", grantedAt: "2026-07-02" },
    { label: "Telemedicine consultation consent", grantedAt: "2026-07-02" },
  ],
};

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
