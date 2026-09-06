export type LegalSection = { id: string; heading: string; body: string[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

/** Placeholder legal copy for the UI phase — not reviewed, not final. */
export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    updated: "2026-09-01",
    sections: [
      {
        id: "what-we-collect",
        heading: "What we collect",
        body: [
          "Account details you give us: name, phone number, email, and — if you choose to share it — your diabetes status.",
          "Intake data: your answers to the symptom questionnaire, your on-screen vision check result, and the eye photos you capture, which you consent to explicitly before the photo step.",
          "Consultation records: appointment details, the triage summary, and the e-prescription your doctor issues.",
          "Payment metadata from our gateway (Razorpay). We do not store card numbers.",
        ],
      },
      {
        id: "how-we-use-it",
        heading: "How we use it",
        body: [
          "To run your consultation: preparing the triage summary for your doctor, holding your appointment slot, and delivering your prescription and recall reminder.",
          "To meet documentation requirements under India's Telemedicine Practice Guidelines (2020).",
          "We do not sell your data or use your eye photos to train third-party models.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights (DPDP Act)",
        body: [
          "You can access the personal data we hold about you and ask us to correct it.",
          "You can withdraw consent for photo and health-data processing, and you can delete your account and associated data from your profile page, subject to records we must retain for regulatory reasons.",
        ],
      },
      {
        id: "security",
        heading: "Security & retention",
        body: [
          "Data is encrypted in transit and at rest. Access by staff and doctors is limited and logged.",
          "We keep consultation records for the period required by medical record-keeping rules, then delete or anonymise them.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "2026-09-01",
    sections: [
      {
        id: "the-service",
        heading: "The service",
        body: [
          "ClearSight connects you with registered ophthalmologists for video consultations and provides an AI-assisted pre-screening flow to support — not replace — the doctor's judgement.",
          "ClearSight is not for medical emergencies. If you have sudden vision loss, severe pain, or an eye injury, seek in-person emergency care immediately.",
        ],
      },
      {
        id: "bookings-payments",
        heading: "Bookings & payments",
        body: [
          "A consultation is confirmed once payment succeeds. Your slot is held only briefly during payment.",
          "Fees are per consultation. Refunds are governed by the Refund Policy.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "Provide accurate information during intake. The triage summary is only as useful as the answers behind it.",
          "Do not record or redistribute consultations without the doctor's consent.",
        ],
      },
    ],
  },
  "telemedicine-consent": {
    title: "Telemedicine Consent",
    updated: "2026-09-01",
    sections: [
      {
        id: "nature",
        heading: "Nature of a teleconsultation",
        body: [
          "A teleconsultation is a remote consultation by video. The doctor cannot perform a physical eye examination and relies on your history, your self-test results, and the photos you provide.",
          "The AI pre-screening is a decision aid for the doctor. It does not diagnose, and its output is not shown to you as a finding.",
        ],
      },
      {
        id: "limitations",
        heading: "Limitations",
        body: [
          "Some conditions cannot be assessed or treated remotely and will need an in-person visit. Your doctor will tell you if that applies.",
          "Technology can fail. If the call cannot proceed, you will be offered an audio-only consult or a reschedule.",
        ],
      },
      {
        id: "consent",
        heading: "Your consent",
        body: [
          "By proceeding you consent to the teleconsultation, to the collection of your intake data and eye photos for this purpose, and to the documentation of the consultation as required by law.",
        ],
      },
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    updated: "2026-09-01",
    sections: [
      {
        id: "full-refund",
        heading: "When you get a full refund",
        body: [
          "The doctor does not join, or the consultation cannot proceed for a reason attributable to ClearSight or the doctor.",
          "You cancel within the free-cancellation window shown at booking.",
        ],
      },
      {
        id: "no-refund",
        heading: "When a refund may not apply",
        body: [
          "You do not join your scheduled consultation (no-show).",
          "You cancel after the free-cancellation window.",
        ],
      },
      {
        id: "how",
        heading: "How refunds are processed",
        body: [
          "Approved refunds are returned to your original payment method through Razorpay, typically within 5–7 working days.",
        ],
      },
    ],
  },
};
