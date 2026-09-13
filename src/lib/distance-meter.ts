/**
 * Camera-based viewing-distance measurement. On-device only: frames never
 * leave the browser. Pinhole model: distance = focal × object / objectPx.
 *
 * The pure math lives at the top (tested); the camera/landmarker lifecycle is
 * below and only loads MediaPipe when started.
 */

// ponytail: population constants — adult iris ≈ 11.7 ± 0.5 mm, IPD ≈ 63 ± 3.5 mm.
export const IRIS_MM = 11.7;
export const IPD_MM = 63;
/** Below this many px the iris edge is too coarse; fall back to IPD. */
export const MIN_IRIS_PX = 12;
export const CALIBRATION_MM = 400;
export const CALIBRATION_SAMPLES = 30;

export type Sample = { irisPx: number; ipdPx: number; t: number };
export type Method = "iris" | "ipd";

export function distanceMm(focalPx: number, objectMm: number, objectPx: number): number {
  return (focalPx * objectMm) / objectPx;
}

export function focalFromCapture(irisPxSamples: number[], distance = CALIBRATION_MM): number {
  return (median(irisPxSamples) * distance) / IRIS_MM;
}

export function pickMethod(irisPx: number): Method {
  return irisPx >= MIN_IRIS_PX ? "iris" : "ipd";
}

export function sampleToMm(focalPx: number, s: Sample): { mm: number; method: Method } {
  const method = pickMethod(s.irisPx);
  return method === "iris"
    ? { mm: distanceMm(focalPx, IRIS_MM, s.irisPx), method }
    : { mm: distanceMm(focalPx, IPD_MM, s.ipdPx), method };
}

export function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function inRange(mm: number, targetMm: number, tolerance = 0.1): boolean {
  return Math.abs(mm - targetMm) <= targetMm * tolerance;
}

// ---- camera + landmarker lifecycle (browser only) ----

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "/models/face_landmarker.task";

// MediaPipe face-mesh indices: iris centres 468 / 473, iris rims 469–472 / 474–477.
const R_IRIS = [469, 471] as const;
const L_IRIS = [474, 476] as const;
const R_CENTER = 468;
const L_CENTER = 473;

export type MeterStatus = "starting" | "running" | "no-camera" | "error";

type Landmark = { x: number; y: number };

/**
 * Starts the front camera into `video`, runs the landmarker each frame and
 * reports iris / IPD sizes in video pixels. Returns a stop() function.
 */
export function startMeter(opts: {
  video: HTMLVideoElement;
  onSample: (s: Sample | null) => void;
  onStatus: (st: MeterStatus) => void;
}): () => void {
  let stopped = false;
  let raf = 0;
  let stream: MediaStream | null = null;
  let landmarker: { detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: Landmark[][] }; close: () => void } | null = null;

  (async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera");
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop()); // unmounted while starting — release the camera
        return;
      }
      opts.video.srcObject = stream;
      await opts.video.play();

      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      if (stopped) {
        landmarker.close();
        return;
      }
      opts.onStatus("running");

      let lastT = -1;
      const tick = () => {
        if (stopped || !landmarker) return;
        const now = performance.now();
        if (opts.video.readyState >= 2 && now !== lastT) {
          lastT = now;
          const res = landmarker.detectForVideo(opts.video, now);
          const lm = res.faceLandmarks?.[0];
          if (lm && lm.length > 477) {
            const w = opts.video.videoWidth;
            const h = opts.video.videoHeight;
            const d = (a: number, b: number) =>
              Math.hypot((lm[a].x - lm[b].x) * w, (lm[a].y - lm[b].y) * h);
            const irisPx = (d(R_IRIS[0], R_IRIS[1]) + d(L_IRIS[0], L_IRIS[1])) / 2;
            opts.onSample({ irisPx, ipdPx: d(R_CENTER, L_CENTER), t: now });
          } else {
            opts.onSample(null);
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {
      if (stopped) return;
      const name = (e as { name?: string; message?: string })?.name ?? "";
      const msg = (e as { message?: string })?.message ?? "";
      opts.onStatus(
        name === "NotAllowedError" || name === "NotFoundError" || msg === "no-camera"
          ? "no-camera"
          : "error",
      );
    }
  })();

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    landmarker?.close();
    stream?.getTracks().forEach((t) => t.stop());
    opts.video.srcObject = null;
  };
}

// ---- smoothing + hysteresis (pure) ----
export const SMOOTH_MS = 1500;
/** In range at ±10 %, stays in range until ±15 % — no flicker at the boundary. */
export const TOL_ENTER = 0.1;
export const TOL_EXIT = 0.15;

export type Timed = { mm: number; method: Method; t: number };

/** Add a reading; return the median over the window and the hysteretic in-range flag. */
export function smooth(
  window: Timed[],
  next: Timed,
  targetMm: number,
  prevOk: boolean,
): { window: Timed[]; mm: number; ok: boolean } {
  const w = window.filter((x) => next.t - x.t < SMOOTH_MS);
  w.push(next);
  const mm = median(w.map((x) => x.mm));
  const ok = inRange(mm, targetMm, prevOk ? TOL_EXIT : TOL_ENTER);
  return { window: w, mm, ok };
}

// ---- guidance (pure) ----
export type GuardState =
  | { kind: "off" }
  | { kind: "starting" }
  | { kind: "no-camera" }
  | { kind: "no-face" }
  | { kind: "reading"; cm: number; ok: boolean };

const fmt = (cm: number) => (cm >= 100 ? `${(cm / 100).toFixed(1)} m` : `${Math.round(cm)} cm`);

/** One-line instruction for the patient, e.g. "Move 60 cm further back". */
export function distanceHint(state: GuardState, targetCm: number): string {
  switch (state.kind) {
    case "off":
      return "";
    case "starting":
      return "Starting camera…";
    case "no-camera":
      return `No camera on this screen — measure ${fmt(targetCm)} with the ruler`;
    case "no-face":
      return "Face not found — stand facing this screen's camera";
    case "reading": {
      if (state.ok) return `${fmt(state.cm)} — good`;
      const step = targetCm >= 100 ? 10 : 1;
      const delta = Math.round(Math.abs(state.cm - targetCm) / step) * step;
      return state.cm > targetCm ? `Move ${fmt(delta)} closer` : `Move ${fmt(delta)} further back`;
    }
  }
}
