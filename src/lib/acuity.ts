/**
 * Visual-acuity exam engine — pure, no React, no DOM.
 *
 * ETDRS-style protocol with tumbling-E optotypes: lines of 5, letter-by-letter
 * scoring (0.02 logMAR per optotype), terminate when a line scores < 3/5.
 * The same reducer runs the 3 m distance test, the 1 m retest and the 40 cm
 * near test — only `distanceMm` changes.
 */
import { z } from "zod";

// ---- optics ----
export const CARD_MM = 85.6; // ISO/IEC 7810 ID-1 width
export const TAN_5_ARCMIN = Math.tan((5 / 60) * (Math.PI / 180));
/** Chart lines, coarsest first: 6/60 … 6/3. */
export const LINES = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, -0.1, -0.2, -0.3] as const;
export const OPTOTYPES_PER_LINE = 5;
export const PASS_MIN = 3;
/** Stroke must be at least this many physical pixels to be a fair optotype. */
export const MIN_STROKE_PHYS_PX = 1.5;

export const DIRS = ["up", "right", "down", "left"] as const;
export type Dir = (typeof DIRS)[number];
export type Answer = Dir | "cant";

/** Optotype height in mm for a logMAR line at a viewing distance (5 arcmin at 0.0). */
export function letterMm(logMAR: number, distanceMm: number): number {
  return distanceMm * TAN_5_ARCMIN * Math.pow(10, logMAR);
}

/** Finest logMAR line this screen can draw fairly (stroke ≥ MIN_STROKE_PHYS_PX). */
export function floorLogMAR(pxPerMm: number, dpr: number, distanceMm: number): number {
  const minLetterMm = (MIN_STROKE_PHYS_PX * OPTOTYPES_PER_LINE) / (pxPerMm * dpr);
  const raw = Math.log10(minLetterMm / (distanceMm * TAN_5_ARCMIN));
  const floor = Math.ceil(raw * 10 - 1e-9) / 10;
  return Math.max(LINES[LINES.length - 1], Math.min(LINES[0], floor));
}

/** "6/x" label for a logMAR value. */
export function snellen(logMAR: number): string {
  const v = 6 * Math.pow(10, logMAR);
  const s = v >= 10 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString();
  return `6/${s}`;
}

/** Optotypes visible at once for a line: as many of the 5 as fit the chart width. */
export function chunkFor(letterMmValue: number, maxWidthMm: number): number {
  // n letters + (n-1) gaps of one letter width = (2n-1) letters wide
  const n = Math.floor((maxWidthMm / letterMmValue + 1) / 2);
  return Math.max(1, Math.min(OPTOTYPES_PER_LINE, n));
}

/** 5 orientations, never more than two identical in a row. */
export function orientationsFor(rng: () => number = Math.random): Dir[] {
  const out: Dir[] = [];
  while (out.length < OPTOTYPES_PER_LINE) {
    const last = out[out.length - 1];
    const twice = out.length >= 2 && last === out[out.length - 2];
    const pool = twice ? DIRS.filter((d) => d !== last) : [...DIRS];
    out.push(pool[Math.floor(rng() * pool.length)]);
  }
  return out;
}

// ---- reducer ----
export type LineResult = {
  logMAR: number;
  chunk: number;
  shown: Dir[];
  answered: Answer[];
};
export type Terminated = "threshold" | "chartLimit" | "belowRange";

export type ExamConfig = {
  distanceMm: number;
  /** Finest line allowed (from floorLogMAR). */
  floor: number;
  maxWidthMm: number;
  rng?: () => number;
};

export type ExamState = {
  cfg: ExamConfig;
  lineIdx: number;
  shown: Dir[];
  answered: Answer[];
  lines: LineResult[];
  terminated: Terminated | null;
};

export function start(cfg: ExamConfig): ExamState {
  return {
    cfg,
    lineIdx: 0,
    shown: orientationsFor(cfg.rng),
    answered: [],
    lines: [],
    terminated: null,
  };
}

export function currentLogMAR(s: ExamState): number {
  return LINES[s.lineIdx];
}
export function currentLetterMm(s: ExamState): number {
  return letterMm(currentLogMAR(s), s.cfg.distanceMm);
}
export function currentChunk(s: ExamState): number {
  return chunkFor(currentLetterMm(s), s.cfg.maxWidthMm);
}
/** Which of the 5 optotypes are on screen right now, and which is being answered. */
export function visible(s: ExamState): { start: number; end: number; index: number } {
  const chunk = currentChunk(s);
  const index = s.answered.length;
  const startIdx = Math.floor(index / chunk) * chunk;
  return { start: startIdx, end: Math.min(startIdx + chunk, OPTOTYPES_PER_LINE), index };
}

export function answer(s: ExamState, a: Answer): ExamState {
  if (s.terminated) return s;
  const answered = [...s.answered, a];
  if (answered.length < OPTOTYPES_PER_LINE) return { ...s, answered };

  const line: LineResult = {
    logMAR: currentLogMAR(s),
    chunk: currentChunk(s),
    shown: s.shown,
    answered,
  };
  const lines = [...s.lines, line];
  const correct = line.shown.filter((d, i) => d === answered[i]).length;

  if (correct < PASS_MIN) {
    return {
      ...s,
      answered,
      lines,
      terminated: s.lineIdx === 0 ? "belowRange" : "threshold",
    };
  }
  const next = s.lineIdx + 1;
  const atFloor = next >= LINES.length || LINES[next] < s.cfg.floor - 1e-9;
  if (atFloor) return { ...s, answered, lines, terminated: "chartLimit" };
  return { ...s, lineIdx: next, shown: orientationsFor(s.cfg.rng), answered: [], lines };
}

// ---- scoring ----
export function correctTotal(lines: LineResult[]): number {
  return lines.reduce(
    (n, l) => n + l.shown.filter((d, i) => d === l.answered[i]).length,
    0,
  );
}

/** ETDRS letter-by-letter: 1.1 − 0.02·N, plus a distance offset for retests. */
export function score(lines: LineResult[], offset = 0): number {
  return Math.round((1.1 - 0.02 * correctTotal(lines) + offset) * 100) / 100;
}

/** Offset to add when tested nearer than the nominal chart distance (e.g. 1 m vs 3 m → +0.48). */
export function distanceOffset(nominalMm: number, testedMm: number): number {
  return Math.log10(nominalMm / testedMm);
}

// ---- result contract (v2) ----
const dirSchema = z.enum(DIRS);
const answerSchema = z.enum([...DIRS, "cant"]);

export const EyeResultSchema = z.object({
  logMAR: z.number(),
  snellen: z.string(),
  correctTotal: z.number().int().nonnegative(),
  retestAt1m: z.boolean(),
  terminated: z.enum(["threshold", "chartLimit", "belowRange"]),
  lines: z.array(
    z.object({
      logMAR: z.number(),
      chunk: z.number().int().min(1).max(5),
      shown: z.array(dirSchema).length(5),
      answered: z.array(answerSchema).length(5),
    }),
  ),
});
export type EyeResult = z.infer<typeof EyeResultSchema>;

export const SkippedSchema = z.object({ skipped: z.literal(true) });
export type Skipped = z.infer<typeof SkippedSchema>;
const eyeOrSkipped = z.union([EyeResultSchema, SkippedSchema]);
export type EyeOrSkipped = z.infer<typeof eyeOrSkipped>;

export const DistanceCheckSchema = z.object({
  method: z.enum(["iris", "ipd", "none"]),
  meanCm: z.number().optional(),
  samples: z.number().int().nonnegative(),
});
export type DistanceCheck = z.infer<typeof DistanceCheckSchema>;

export const AcuityResultSchema = z.object({
  version: z.literal(2),
  method: z.literal("etdrs-tumbling-e"),
  correction: z.enum(["glasses", "contacts", "none"]),
  calibration: z.object({
    pxPerMm: z.number().positive(),
    dpr: z.number().positive(),
    screen: z.string(),
    verified: z.literal(true),
    focalPx: z.number().positive().optional(),
  }),
  distance: z.object({
    meters: z.union([z.literal(3), z.literal(2)]),
    mode: z.enum(["paired", "helper"]),
    check: DistanceCheckSchema,
    right: eyeOrSkipped,
    left: eyeOrSkipped,
  }),
  near: z
    .object({
      cm: z.literal(40),
      check: DistanceCheckSchema,
      right: eyeOrSkipped,
      left: eyeOrSkipped,
    })
    .optional(),
});
export type AcuityResult = z.infer<typeof AcuityResultSchema>;

/** Whole-test skip: patient could not do the check at all. */
export const SkippedTestSchema = z.object({
  version: z.literal(2),
  skipped: z.literal(true),
});
export const AcuitySubmissionSchema = z.union([AcuityResultSchema, SkippedTestSchema]);
export type AcuitySubmission = z.infer<typeof AcuitySubmissionSchema>;

export function toEyeResult(
  s: ExamState,
  opts: { retestAt1m: boolean; offset: number },
): EyeResult {
  const terminated = s.terminated ?? "threshold";
  const logMAR = score(s.lines, opts.offset);
  return {
    logMAR,
    snellen: snellen(logMAR),
    correctTotal: correctTotal(s.lines),
    retestAt1m: opts.retestAt1m,
    terminated,
    lines: s.lines,
  };
}

// ---- display ----
export function isSkipped(e: EyeOrSkipped | undefined | null): e is Skipped {
  return !!e && "skipped" in e;
}

/** Short display string: "6/7.5", "≥ 6/6*", "< 6/60 @ 1 m", "Skipped", "—". */
export function summary(e: EyeOrSkipped | undefined | null, long = false): string {
  if (!e) return "—";
  if (isSkipped(e)) return "Skipped";
  if (e.terminated === "belowRange") return e.retestAt1m ? "< 6/60 @ 1 m" : "< 6/60";
  const base = e.terminated === "chartLimit" ? `≥ ${e.snellen}*` : e.snellen;
  return long ? `${base} (logMAR ${e.logMAR.toFixed(2)})` : base;
}

/** Legacy v1 rows stored `{ right: "6/9", left: "6/12" }` strings. */
export function legacyOrV2(raw: unknown): {
  distanceRight: string;
  distanceLeft: string;
  nearRight?: string;
  nearLeft?: string;
  note?: string;
} {
  const parsed = AcuitySubmissionSchema.safeParse(raw);
  if (parsed.success) {
    const r = parsed.data;
    if ("skipped" in r) {
      return { distanceRight: "Skipped", distanceLeft: "Skipped", note: "Patient could not do the eye test" };
    }
    const retest = [r.distance.right, r.distance.left].some(
      (e) => !isSkipped(e) && e.retestAt1m,
    );
    const note = [
      `${r.distance.meters} m · ${r.distance.mode === "paired" ? "phone remote" : "helper-held"}`,
      r.correction === "none" ? "unaided" : `with ${r.correction}`,
      r.distance.check.method === "none"
        ? "distance by ruler"
        : `camera-checked ${r.distance.check.meanCm?.toFixed(0) ?? "?"} cm`,
      retest ? "6/60 line retested at 1 m" : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      distanceRight: summary(r.distance.right),
      distanceLeft: summary(r.distance.left),
      nearRight: summary(r.near?.right),
      nearLeft: summary(r.near?.left),
      note,
    };
  }
  const o = (raw ?? {}) as { right?: string; left?: string };
  return { distanceRight: o.right || "—", distanceLeft: o.left || "—" };
}
