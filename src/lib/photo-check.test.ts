import { test } from "node:test";
import assert from "node:assert/strict";
import { toGray, exposure, sharpness, dHash, hamming, judgeQuality } from "./photo-check.ts";
import { reportFromLandmarks, judgeShot, type Landmark } from "./eye-check.ts";

const flat = (w: number, h: number, v: number) => new Uint8Array(w * h).fill(v);
const checker = (w: number, h: number) => {
  const g = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = (x + y) % 2 ? 255 : 0;
  return g;
};

test("gray + exposure", () => {
  const rgba = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
  const g = toGray(rgba);
  assert.deepEqual([...g], [255, 0]);
  const e = exposure(g);
  assert.equal(e.mean, 127.5);
  assert.equal(e.clippedHigh, 0.5);
  assert.equal(e.clippedLow, 0.5);
});

test("sharpness: flat is 0, checkerboard is high", () => {
  assert.equal(sharpness(flat(20, 20, 100), 20, 20), 0);
  assert.ok(sharpness(checker(20, 20), 20, 20) > 10000);
});

test("dHash: same image → same hash; different → far", () => {
  const a = dHash(checker(64, 48), 64, 48);
  assert.equal(a.length, 16);
  assert.equal(hamming(a, dHash(checker(64, 48), 64, 48)), 0);
  const grad = new Uint8Array(64 * 48).map((_, i) => (i % 64) * 4);
  assert.ok(hamming(a, dHash(grad, 64, 48)) > 20);
});

test("judgeQuality thresholds", () => {
  const ok = { w: 1600, h: 1200, mean: 120, clippedHigh: 0.01, sharp: 200 };
  assert.deepEqual(judgeQuality(ok), []);
  assert.equal(judgeQuality({ ...ok, w: 600 })[0].code, "small");
  assert.equal(judgeQuality({ ...ok, mean: 30 })[0].code, "dark");
  assert.equal(judgeQuality({ ...ok, clippedHigh: 0.4 })[0].code, "bright");
  assert.equal(judgeQuality({ ...ok, sharp: 5 })[0].code, "blur");
});

/** Synthetic face: 478 points; eyes at given centres with iris radius r and lid gap. */
function face(opts: { rx: number; lx: number; y: number; r: number; gapR: number; gapL: number; faceW: number }): Landmark[] {
  const lm: Landmark[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  const set = (i: number, x: number, y: number) => (lm[i] = { x, y });
  set(468, opts.rx, opts.y); set(469, opts.rx - opts.r, opts.y); set(471, opts.rx + opts.r, opts.y);
  set(159, opts.rx, opts.y - opts.gapR / 2); set(145, opts.rx, opts.y + opts.gapR / 2);
  set(473, opts.lx, opts.y); set(474, opts.lx - opts.r, opts.y); set(476, opts.lx + opts.r, opts.y);
  set(386, opts.lx, opts.y - opts.gapL / 2); set(374, opts.lx, opts.y + opts.gapL / 2);
  set(234, 0.5 - opts.faceW / 2, opts.y); set(454, 0.5 + opts.faceW / 2, opts.y);
  return lm;
}
const W = 1600, H = 1200;

test("shot 0: no face fails; closed eye fails; small face warns", () => {
  assert.equal(judgeShot(0, reportFromLandmarks(undefined, W, H), W)[0].code, "no-face");
  const open = face({ rx: 0.4, lx: 0.6, y: 0.5, r: 0.01, gapR: 0.02, gapL: 0.02, faceW: 0.5 });
  assert.deepEqual(judgeShot(0, reportFromLandmarks(open, W, H), W), []);
  const wink = face({ rx: 0.4, lx: 0.6, y: 0.5, r: 0.01, gapR: 0.02, gapL: 0.002, faceW: 0.5 });
  assert.equal(judgeShot(0, reportFromLandmarks(wink, W, H), W)[0].code, "closed");
  const far = face({ rx: 0.45, lx: 0.55, y: 0.5, r: 0.01, gapR: 0.02, gapL: 0.02, faceW: 0.2 });
  assert.equal(judgeShot(0, reportFromLandmarks(far, W, H), W)[0].code, "far");
});

test("shot 1 (right eye): wrong eye, too small, glare", () => {
  // right eye centred and big → clean
  const good = face({ rx: 0.5, lx: 0.9, y: 0.5, r: 0.03, gapR: 0.06, gapL: 0.06, faceW: 0.8 });
  assert.deepEqual(judgeShot(1, reportFromLandmarks(good, W, H), W), []);
  // left eye centred instead
  const wrong = face({ rx: 0.1, lx: 0.5, y: 0.5, r: 0.03, gapR: 0.06, gapL: 0.06, faceW: 0.8 });
  assert.equal(judgeShot(1, reportFromLandmarks(wrong, W, H), W)[0].code, "wrong-eye");
  // tiny iris (r 0.01 → 32 px)
  const small = face({ rx: 0.5, lx: 0.9, y: 0.5, r: 0.01, gapR: 0.02, gapL: 0.02, faceW: 0.8 });
  assert.equal(judgeShot(1, reportFromLandmarks(small, W, H), W)[0].code, "small-eye");
  // glare: every pixel in the iris is near-white
  const glare = reportFromLandmarks(good, W, H, () => [250, 250, 250]);
  assert.ok((glare.right?.glare ?? 0) > 0.9);
  assert.equal(judgeShot(1, glare, W)[0].code, "glare");
  // no face → soft only
  assert.equal(judgeShot(1, reportFromLandmarks(undefined, W, H), W)[0].level, "warn");
});
