"use client";

import type { Answers } from "@/lib/mock/intake";

/**
 * Draft intake state for the UI phase. sessionStorage only — cleared when the
 * tab closes; the backend `TriageRecord` replaces this in Step 6.
 */
export type IntakeDraft = {
  answers: Answers;
  acuity?: { right: string; left: string; distanceOk: boolean };
  photos: string[]; // object URLs / data URIs
  photoConsent: boolean;
};

const KEY = "clearsight.intake";

const EMPTY: IntakeDraft = { answers: {}, photos: [], photoConsent: false };

export function readDraft(): IntakeDraft {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function writeDraft(patch: Partial<IntakeDraft>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...readDraft(), ...patch };
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — draft just won't persist across steps */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
