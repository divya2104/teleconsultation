/**
 * Is there an eye in the picture, is it open, is it the right one, is there
 * glare on it? Built on the MediaPipe face landmarker already used for the
 * distance guard. Pure judgement functions are separated from the model glue.
 */
import type { Finding } from "@/lib/photo-check";

// MediaPipe face-mesh indices (subject's anatomical side, not image side).
const R = { upper: 159, lower: 145, iris: 468, rimA: 469, rimB: 471 } as const;
const L = { upper: 386, lower: 374, iris: 473, rimA: 474, rimB: 476 } as const;
const CHEEK_R = 234;
const CHEEK_L = 454;

// ponytail: thresholds from a handful of test captures; tune with real data.
export const OPEN_MIN = 0.25; // eyelid gap / iris diameter
export const FACE_FRAC_MIN = 0.3; // face width / image width (straight-on shot)
export const IRIS_PX_MIN = 60; // iris diameter in the 1600-px image (close-ups)
export const GLARE_FRAC = 0.08; // share of near-white pixels inside the iris

export type Landmark = { x: number; y: number };
export type EyeInfo = { cx: number; cy: number; irisPx: number; openness: number; glare: number };
export type EyeReport = { found: boolean; faceWidthFrac: number; right?: EyeInfo; left?: EyeInfo };
export type Shot = 0 | 1 | 2; // straight-on · right close-up · left close-up

type PixelAt = (x: number, y: number) => [number, number, number] | null;

function eye(lm: Landmark[], w: number, h: number, ix: typeof R | typeof L, px?: PixelAt): EyeInfo {
  const d = (a: number, b: number) => Math.hypot((lm[a].x - lm[b].x) * w, (lm[a].y - lm[b].y) * h);
  const irisPx = d(ix.rimA, ix.rimB);
  const gap = d(ix.upper, ix.lower);
  const cx = lm[ix.iris].x * w;
  const cy = lm[ix.iris].y * h;
  let glare = 0;
  if (px && irisPx > 8) {
    const r = irisPx / 2;
    let n = 0;
    let bright = 0;
    for (let y = Math.floor(cy - r); y <= cy + r; y += 1) {
      for (let x = Math.floor(cx - r); x <= cx + r; x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
        const p = px(x, y);
        if (!p) continue;
        n++;
        if (Math.min(p[0], p[1], p[2]) > 235) bright++;
      }
    }
    glare = n ? bright / n : 0;
  }
  return { cx, cy, irisPx, openness: irisPx ? gap / irisPx : 0, glare };
}

/** Pure: build the report from landmarks (normalised 0–1) for an image w×h. */
export function reportFromLandmarks(lm: Landmark[] | undefined, w: number, h: number, px?: PixelAt): EyeReport {
  if (!lm || lm.length < 478) return { found: false, faceWidthFrac: 0 };
  const faceW = Math.hypot((lm[CHEEK_R].x - lm[CHEEK_L].x) * w, (lm[CHEEK_R].y - lm[CHEEK_L].y) * h);
  return { found: true, faceWidthFrac: faceW / w, right: eye(lm, w, h, R, px), left: eye(lm, w, h, L, px) };
}

/** Pure: per-shot findings. */
export function judgeShot(shot: Shot, r: EyeReport, w: number): Finding[] {
  const out: Finding[] = [];
  if (shot === 0) {
    if (!r.found) {
      out.push({ level: "fail", code: "no-face", message: "We couldn't see your face — face the camera with both eyes open." });
      return out;
    }
    if (r.faceWidthFrac < FACE_FRAC_MIN) out.push({ level: "warn", code: "far", message: "Move closer so your face fills the oval." });
    if ((r.right?.openness ?? 0) < OPEN_MIN || (r.left?.openness ?? 0) < OPEN_MIN) {
      out.push({ level: "fail", code: "closed", message: "Open both eyes wide and look at the camera." });
    }
    return out;
  }
  const want = shot === 1 ? "right" : "left";
  if (!r.found) {
    out.push({ level: "warn", code: "no-eye", message: `Couldn't confirm an eye is in the picture — keep your ${want} eye, brow and cheek in the circle.` });
    return out;
  }
  const target = shot === 1 ? r.right! : r.left!;
  const otherEye = shot === 1 ? r.left! : r.right!;
  if (Math.abs(otherEye.cx - w / 2) < Math.abs(target.cx - w / 2)) {
    out.push({ level: "warn", code: "wrong-eye", message: `This looks like your ${want === "right" ? "left" : "right"} eye — this photo is for the ${want} eye.` });
  }
  if (target.irisPx < IRIS_PX_MIN) out.push({ level: "warn", code: "small-eye", message: "Move closer so the eye fills the circle." });
  if (target.openness < OPEN_MIN) out.push({ level: "fail", code: "closed", message: "Open the eye wide — lift the brow if needed." });
  if (target.glare > GLARE_FRAC) out.push({ level: "warn", code: "glare", message: "Bright reflection on the eye — turn off the flash and avoid a window behind you." });
  return out;
}

// ---------- model glue (browser) ----------

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "/models/face_landmarker.task";

type Landmarker = {
  detect: (img: HTMLCanvasElement) => { faceLandmarks: Landmark[][] };
  detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: Landmark[][] };
  close: () => void;
};
const cache: Partial<Record<"IMAGE" | "VIDEO", Promise<Landmarker>>> = {};

export function getLandmarker(mode: "IMAGE" | "VIDEO"): Promise<Landmarker> {
  cache[mode] ??= (async () => {
    const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
    return (await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: mode,
      numFaces: 1,
    })) as unknown as Landmarker;
  })();
  return cache[mode]!;
}

export function pixelReader(c: HTMLCanvasElement): PixelAt {
  const { width: w, height: h } = c;
  const d = c.getContext("2d")!.getImageData(0, 0, w, h).data;
  return (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return null;
    const i = (y * w + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
}

/** Landmarks for a still; null when the model fails to load (checks degrade to soft). */
export async function landmarksForCanvas(c: HTMLCanvasElement): Promise<Landmark[] | undefined | null> {
  try {
    const lm = await getLandmarker("IMAGE");
    return lm.detect(c).faceLandmarks?.[0];
  } catch {
    return null;
  }
}
