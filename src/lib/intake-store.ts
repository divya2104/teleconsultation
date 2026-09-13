"use client";

import type { Answers } from "@/lib/mock/intake";
import type {
  AcuitySubmission,
  DistanceCheck,
  EyeOrSkipped,
} from "@/lib/acuity";

/** Eye-test progress, filled in eye by eye so a reload resumes. */
export type AcuityDraft = {
  skipped?: true;
  correction?: "glasses" | "contacts" | "none";
  mode?: "paired" | "helper";
  meters?: 3 | 2;
  distance?: { right?: EyeOrSkipped; left?: EyeOrSkipped; check?: DistanceCheck };
  near?: { right?: EyeOrSkipped; left?: EyeOrSkipped; check?: DistanceCheck };
};

/**
 * Draft intake state for the UI phase. sessionStorage only — cleared when the
 * tab closes; the backend `TriageRecord` replaces this in Step 6.
 */
export type IntakeDraft = {
  answers: Answers;
  acuity?: AcuityDraft;
  /** JPEG data URLs by shot index (0 straight-on · 1 right eye · 2 left eye); "" = empty slot. */
  photos: string[];
  /** Soft findings per shot, shown on the slot cards and the review. */
  photoWarnings?: string[][];
  /** Perceptual hashes per shot, for the "same photo twice" check. */
  photoHashes?: string[];
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

/** Returns false when the draft could not be stored (quota / storage disabled). */
export function writeDraft(patch: Partial<IntakeDraft>): boolean {
  if (typeof window === "undefined") return false;
  try {
    const next = { ...readDraft(), ...patch };
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false; // storage unavailable — draft just won't persist across steps
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

// ---- screen calibration: per device, survives sessions ----

export type Calibration = {
  screen: string; // "390x844@3"
  pxPerMm: number;
  focalPx?: number;
};

const CAL_KEY = "clearsight.calibration";

export function screenKey(): string {
  if (typeof window === "undefined") return "";
  return `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`;
}

export function readCalibration(): Calibration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CAL_KEY);
    const c = raw ? (JSON.parse(raw) as Calibration) : null;
    return c && c.screen === screenKey() && c.pxPerMm > 0 ? c : null;
  } catch {
    return null;
  }
}

export function writeCalibration(patch: Partial<Calibration>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...(readCalibration() ?? { pxPerMm: 0 }), ...patch, screen: screenKey() };
    window.localStorage.setItem(CAL_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

const NONE: DistanceCheck = { method: "none", samples: 0 };
const SKIP = { skipped: true as const };

/** Assemble the submission; anything missing is recorded as skipped, never blocks. */
export function buildAcuitySubmission(
  d: AcuityDraft | undefined,
  cal: Calibration | null,
): AcuitySubmission {
  if (!d || d.skipped || !cal || !d.correction || !d.mode || !d.meters) {
    return { version: 2, skipped: true };
  }
  return {
    version: 2,
    method: "etdrs-tumbling-e",
    correction: d.correction,
    calibration: {
      pxPerMm: cal.pxPerMm,
      dpr: typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
      screen: cal.screen,
      verified: true,
      focalPx: cal.focalPx,
    },
    distance: {
      meters: d.meters,
      mode: d.mode,
      check: d.distance?.check ?? NONE,
      right: d.distance?.right ?? SKIP,
      left: d.distance?.left ?? SKIP,
    },
    near: {
      cm: 40,
      check: d.near?.check ?? NONE,
      right: d.near?.right ?? SKIP,
      left: d.near?.left ?? SKIP,
    },
  };
}
