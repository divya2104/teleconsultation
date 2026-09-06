export const INTAKE_STEPS = ["questionnaire", "acuity", "photos", "review"] as const;
export type IntakeStep = (typeof INTAKE_STEPS)[number];
export const STEP_LABELS = ["Questionnaire", "Vision check", "Photos", "Review"];

export type Question = {
  id: string;
  text: string;
  type: "single" | "multi" | "text";
  options?: { value: string; label: string; redFlag?: boolean; urgency?: number }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "onset",
    text: "When did the problem start?",
    type: "single",
    options: [
      { value: "today", label: "Today", urgency: 2 },
      { value: "days", label: "In the last few days", urgency: 1 },
      { value: "weeks", label: "Weeks ago", urgency: 0 },
      { value: "months", label: "Months ago or longer", urgency: 0 },
    ],
  },
  {
    id: "symptoms",
    text: "Which of these are you experiencing? (select all)",
    type: "multi",
    options: [
      { value: "blur", label: "Blurred vision", urgency: 1 },
      { value: "redness", label: "Redness", urgency: 1 },
      { value: "discharge", label: "Discharge or watering", urgency: 0 },
      { value: "itching", label: "Itching", urgency: 0 },
      { value: "pain", label: "Eye pain", urgency: 1 },
      { value: "sudden_loss", label: "Sudden loss of vision", redFlag: true, urgency: 3 },
      { value: "flashes", label: "New flashes or floaters", redFlag: true, urgency: 3 },
      { value: "injury", label: "Recent eye injury or chemical splash", redFlag: true, urgency: 3 },
      { value: "halos", label: "Halos around lights with headache", redFlag: true, urgency: 3 },
    ],
  },
  {
    id: "which_eye",
    text: "Which eye is affected?",
    type: "single",
    options: [
      { value: "right", label: "Right" },
      { value: "left", label: "Left" },
      { value: "both", label: "Both" },
    ],
  },
  {
    id: "contacts",
    text: "Do you wear contact lenses?",
    type: "single",
    options: [
      { value: "yes", label: "Yes", urgency: 1 },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "notes",
    text: "Anything else you'd like the doctor to know?",
    type: "text",
  },
];

export type Answers = Record<string, string | string[]>;

/** Rule-based urgency: 0 routine · 1–2 review · 3 urgent (emergency advisory). */
export function scoreUrgency(answers: Answers): {
  level: 0 | 1 | 2 | 3;
  redFlags: string[];
} {
  let score = 0;
  const redFlags: string[] = [];
  for (const q of QUESTIONS) {
    if (!q.options) continue;
    const a = answers[q.id];
    const picked = Array.isArray(a) ? a : a ? [a] : [];
    for (const opt of q.options) {
      if (!picked.includes(opt.value)) continue;
      score += opt.urgency ?? 0;
      if (opt.redFlag) redFlags.push(opt.label);
    }
  }
  const level = redFlags.length ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
  return { level: level as 0 | 1 | 2 | 3, redFlags };
}

// ---- acuity ----
// ponytail: fixed optotype rows + a self-reported distance calibration.
// A real calibrated chart needs screen-DPI + measured distance; upgrade path
// is a credit-card-on-screen size reference feeding true logMAR sizing.
export const ACUITY_ROWS = [
  { snellen: "6/60", letters: "E" },
  { snellen: "6/36", letters: "F P" },
  { snellen: "6/24", letters: "T O Z" },
  { snellen: "6/18", letters: "L P E D" },
  { snellen: "6/12", letters: "P E C F D" },
  { snellen: "6/9", letters: "E D F C Z P" },
  { snellen: "6/6", letters: "F E L O P Z D" },
];
