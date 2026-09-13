import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LINES, letterMm, floorLogMAR, snellen, chunkFor, orientationsFor,
  start, answer, visible, score, distanceOffset, toEyeResult, summary,
  legacyOrV2, AcuitySubmissionSchema, type Dir, type ExamState,
} from "./acuity.ts";
import { distanceMm, focalFromCapture, median, sampleToMm, inRange, distanceHint, smooth, IRIS_MM } from "./distance-meter.ts";

const close = (a: number, b: number, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test("letter sizes: 6/6 at 3 m, 1 m, 40 cm", () => {
  close(letterMm(0, 3000), 4.363, 0.01);
  close(letterMm(0, 1000), 1.454, 0.01);
  close(letterMm(0, 400), 0.582, 0.01);
  close(letterMm(1, 3000), 43.63, 0.1);
});

test("floor: 96 dpi laptop caps the 40 cm test, phones reach 6/6", () => {
  const laptop = floorLogMAR(3.78, 1, 400);
  assert.ok(laptop >= 0.3, `laptop floor ${laptop}`);
  const phone = floorLogMAR(3.78 * 3, 3, 400); // ~460 ppi
  assert.ok(phone <= 0.0, `phone floor ${phone}`);
  assert.equal(floorLogMAR(3.78, 1, 3000), -0.3);
});

test("snellen labels", () => {
  assert.equal(snellen(0), "6/6");
  assert.equal(snellen(0.1), "6/7.6");
  assert.equal(snellen(0.3), "6/12");
  assert.equal(snellen(1), "6/60");
  assert.equal(snellen(-0.3), "6/3");
});

test("chunking: 5 fit on a wide chart, 1 on a phone for 6/60", () => {
  assert.equal(chunkFor(43.6, 300), 3);
  assert.equal(chunkFor(43.6, 150), 2);
  assert.equal(chunkFor(4.36, 150), 5);
  assert.equal(chunkFor(100, 50), 1);
});

test("orientations: 5 dirs, never 3 identical in a row", () => {
  const rng = () => 0; // always picks the first pool entry
  const o = orientationsFor(rng);
  assert.equal(o.length, 5);
  for (let i = 2; i < 5; i++) assert.ok(!(o[i] === o[i - 1] && o[i - 1] === o[i - 2]));
});

const cfg = { distanceMm: 3000, floor: -0.3, maxWidthMm: 400, rng: () => 0.5 };
const readLine = (s: ExamState, correct: number): ExamState => {
  for (let i = 0; i < 5; i++) {
    const wrong: Dir = s.shown[i] === "up" ? "down" : "up";
    s = answer(s, i < correct ? s.shown[i] : wrong);
  }
  return s;
};

test("reducer: perfect read runs to the chart end (chartLimit), score −0.3", () => {
  let s = start(cfg);
  for (let i = 0; i < LINES.length; i++) s = readLine(s, 5);
  assert.equal(s.terminated, "chartLimit");
  assert.equal(s.lines.length, 14);
  close(score(s.lines), -0.3);
});

test("reducer: device floor stops the descent", () => {
  let s = start({ ...cfg, floor: 0.3 });
  for (let i = 0; i < 20 && !s.terminated; i++) s = readLine(s, 5);
  assert.equal(s.terminated, "chartLimit");
  assert.equal(s.lines.at(-1)?.logMAR, 0.3);
});

test("reducer: threshold at <3/5, ETDRS 1.1 − 0.02N", () => {
  let s = start(cfg);
  for (let i = 0; i < 10; i++) s = readLine(s, 5); // 1.0 … 0.1 all correct (50)
  s = readLine(s, 2); // 0.0 line: 2/5 → stop
  assert.equal(s.terminated, "threshold");
  close(score(s.lines), 1.1 - 0.02 * 52);
  const r = toEyeResult(s, { retestAt1m: false, offset: 0 });
  assert.equal(r.correctTotal, 52);
  assert.equal(summary(r), "6/6.9");
  assert.equal(summary(r, true), "6/6.9 (logMAR 0.06)");
});

test("reducer: failing the top line is belowRange; 1 m retest offsets +0.48", () => {
  let s = start(cfg);
  s = readLine(s, 1);
  assert.equal(s.terminated, "belowRange");
  close(distanceOffset(3000, 1000), 0.477, 0.001);
  let r = start({ ...cfg, distanceMm: 1000 });
  r = readLine(r, 5);
  r = readLine(r, 2);
  const res = toEyeResult(r, { retestAt1m: true, offset: distanceOffset(3000, 1000) });
  close(res.logMAR, 1.1 - 0.02 * 7 + 0.477, 0.01);
  assert.ok(res.retestAt1m);
});

test("visible: chunk windows advance with answers", () => {
  let s = start({ ...cfg, maxWidthMm: 150 }); // 6/60 → chunk 2
  assert.deepEqual(visible(s), { start: 0, end: 2, index: 0 });
  s = answer(s, s.shown[0]);
  s = answer(s, s.shown[1]);
  assert.deepEqual(visible(s), { start: 2, end: 4, index: 2 });
  s = answer(s, s.shown[2]);
  s = answer(s, s.shown[3]);
  assert.deepEqual(visible(s), { start: 4, end: 5, index: 4 });
});

test("schema + legacy display", () => {
  let s = start(cfg);
  s = readLine(s, 5);
  s = readLine(s, 1);
  const eye = toEyeResult(s, { retestAt1m: false, offset: 0 });
  const full = {
    version: 2, method: "etdrs-tumbling-e", correction: "glasses",
    calibration: { pxPerMm: 6.2, dpr: 3, screen: "390x844@3", verified: true, focalPx: 500 },
    distance: { meters: 3, mode: "helper", check: { method: "iris", meanCm: 298, samples: 40 }, right: eye, left: { skipped: true } },
    near: { cm: 40, check: { method: "none", samples: 0 }, right: eye, left: eye },
  };
  assert.ok(AcuitySubmissionSchema.safeParse(full).success);
  assert.ok(AcuitySubmissionSchema.safeParse({ version: 2, skipped: true }).success);
  assert.ok(!AcuitySubmissionSchema.safeParse({ version: 2 }).success);
  const d = legacyOrV2(full);
  assert.equal(d.distanceLeft, "Skipped");
  assert.equal(d.distanceRight, "6/57");
  assert.match(d.note ?? "", /helper-held/);
  assert.deepEqual(legacyOrV2({ right: "6/9", left: "6/12" }), { distanceRight: "6/9", distanceLeft: "6/12" });
  assert.equal(legacyOrV2({ version: 2, skipped: true }).distanceRight, "Skipped");
});

test("distance meter math", () => {
  const f = focalFromCapture([29, 30, 31, 100, 1], 400); // median 30 px at 40 cm
  close(f, (30 * 400) / IRIS_MM, 0.01);
  close(distanceMm(f, IRIS_MM, 30), 400, 0.01);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(sampleToMm(f, { irisPx: 30, ipdPx: 160, t: 0 }).method, "iris");
  const far = sampleToMm(f, { irisPx: 4, ipdPx: 21.5, t: 0 });
  assert.equal(far.method, "ipd");
  close(far.mm, (f * 63) / 21.5, 0.01);
  assert.ok(inRange(380, 400) && !inRange(350, 400));
});

test("distance guidance text", () => {
  assert.equal(distanceHint({ kind: "off" }, 300), "");
  assert.match(distanceHint({ kind: "no-camera" }, 300), /measure 3\.0 m with the ruler/);
  assert.match(distanceHint({ kind: "no-face" }, 300), /Face not found/);
  assert.equal(distanceHint({ kind: "reading", cm: 240, ok: false }, 300), "Move 60 cm further back");
  assert.equal(distanceHint({ kind: "reading", cm: 345, ok: false }, 300), "Move 50 cm closer");
  assert.equal(distanceHint({ kind: "reading", cm: 296, ok: true }, 300), "3.0 m — good");
  assert.equal(distanceHint({ kind: "reading", cm: 33, ok: false }, 40), "Move 7 cm further back");
  assert.equal(distanceHint({ kind: "reading", cm: 41, ok: true }, 40), "41 cm — good");
});

test("smoothing: median over 1.5 s window, hysteresis 10 % in / 15 % out", () => {
  let st = { window: [] as ReturnType<typeof smooth>["window"], mm: 0, ok: false };
  const feed = (mm: number, t: number) => (st = smooth(st.window, { mm, method: "ipd", t }, 3000, st.ok));
  feed(3000, 0);
  assert.ok(st.ok);
  feed(3400, 100); // one outlier does not flip the median
  assert.equal(st.mm, 3200);
  assert.ok(st.ok, "still ok at 6.7 % off");
  feed(3400, 200);
  assert.equal(st.mm, 3400);
  assert.ok(st.ok, "13 % off but inside the 15 % exit band");
  feed(3500, 300);
  feed(3500, 400);
  feed(3500, 500);
  feed(3500, 600);
  assert.equal(st.mm, 3500);
  assert.ok(!st.ok, "16.7 % off leaves the range");
  feed(3320, 2200); // window expired → single sample, 10.7 % off → not back yet
  assert.ok(!st.ok);
  feed(3260, 2300);
  assert.ok(st.ok, "re-enters inside 10 %");
  assert.equal(st.window.length, 2, "old samples dropped from the window");
});
