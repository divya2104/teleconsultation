/**
 * Eye-photo quality checks. Pure metrics over grayscale pixel arrays (tested),
 * plus browser glue that decodes, orients, resizes and re-encodes captures.
 * Runs entirely on the patient's device; nothing here is clinical screening.
 */

export const MIN_SIDE_PX = 720;
export const MAX_BYTES = 10 * 1024 * 1024;
export const OUT_MAX_PX = 1600;
export const ANALYSIS_W = 320;
export const JPEG_QUALITY = 0.85;

// ponytail: thresholds eyeballed on a couple of phones; tune with field captures.
export const DARK_MEAN = 55;
export const BRIGHT_MEAN = 205;
export const CLIPPED_FRAC = 0.2;
export const BLUR_VAR = 30;

export type Level = "ok" | "warn" | "fail";
export type Finding = { level: Level; code: string; message: string };

export function toGray(rgba: Uint8ClampedArray | Uint8Array): Uint8Array {
  const n = rgba.length >> 2;
  const g = new Uint8Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    g[i] = (rgba[j] * 299 + rgba[j + 1] * 587 + rgba[j + 2] * 114) / 1000;
  }
  return g;
}

/** Mean luminance and the share of pixels clipped at either end. */
export function exposure(gray: Uint8Array): { mean: number; clippedHigh: number; clippedLow: number } {
  let sum = 0;
  let hi = 0;
  let lo = 0;
  for (let i = 0; i < gray.length; i++) {
    const v = gray[i];
    sum += v;
    if (v >= 250) hi++;
    else if (v <= 5) lo++;
  }
  const n = gray.length || 1;
  return { mean: sum / n, clippedHigh: hi / n, clippedLow: lo / n };
}

/** Variance of the 4-neighbour Laplacian — low means blurry. */
export function sharpness(gray: Uint8Array, w: number, h: number): number {
  if (w < 3 || h < 3) return 0;
  let sum = 0;
  let sq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const l = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      sum += l;
      sq += l * l;
      n++;
    }
  }
  const mean = sum / n;
  return sq / n - mean * mean;
}

/** 64-bit difference hash (9×8 grid) as hex; near-identical images share most bits. */
export function dHash(gray: Uint8Array, w: number, h: number): string {
  const cell = (gx: number, gy: number) => {
    const x = Math.min(w - 1, Math.floor(((gx + 0.5) * w) / 9));
    const y = Math.min(h - 1, Math.floor(((gy + 0.5) * h) / 8));
    return gray[y * w + x];
  };
  let out = "";
  for (let gy = 0; gy < 8; gy++) {
    let byte = 0;
    for (let gx = 0; gx < 8; gx++) {
      byte = (byte << 1) | (cell(gx, gy) < cell(gx + 1, gy) ? 1 : 0);
    }
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

export function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}

export type QualityMetrics = { w: number; h: number; mean: number; clippedHigh: number; sharp: number };

/** Hard/soft findings from the raw metrics. Pure. */
export function judgeQuality(m: QualityMetrics): Finding[] {
  const out: Finding[] = [];
  if (Math.min(m.w, m.h) < MIN_SIDE_PX) {
    out.push({ level: "fail", code: "small", message: "Photo is too small — use the camera, not a screenshot or thumbnail." });
  }
  if (m.mean < DARK_MEAN) {
    out.push({ level: "fail", code: "dark", message: "Too dark — face a window or turn on a light." });
  } else if (m.mean > BRIGHT_MEAN || m.clippedHigh > CLIPPED_FRAC) {
    out.push({ level: "fail", code: "bright", message: "Too bright — move out of direct light." });
  }
  if (m.sharp < BLUR_VAR) {
    out.push({ level: "fail", code: "blur", message: "Blurry — hold still and tap the eye to focus." });
  }
  return out;
}

export const hasFail = (f: Finding[]) => f.some((x) => x.level === "fail");

// ---------- browser glue ----------

async function blobToBitmap(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(blob);
    } catch {
      const url = URL.createObjectURL(blob);
      try {
        const img = new Image();
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error("undecodable"));
          img.src = url;
        });
        return img;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
}

/** Draw any source onto a canvas no larger than `max` on its long side. */
export function drawScaled(
  src: CanvasImageSource & { width?: number; height?: number; videoWidth?: number; videoHeight?: number },
  max: number,
): HTMLCanvasElement {
  const sw = (src as HTMLVideoElement).videoWidth || (src.width as number);
  const sh = (src as HTMLVideoElement).videoHeight || (src.height as number);
  const k = Math.min(1, max / Math.max(sw, sh));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(sw * k));
  c.height = Math.max(1, Math.round(sh * k));
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** Decode a file/blob with EXIF orientation applied, resized to OUT_MAX_PX. */
export async function decodeBlob(blob: Blob): Promise<HTMLCanvasElement> {
  if (blob.size > MAX_BYTES) throw new Error("too-large");
  const bmp = await blobToBitmap(blob);
  const c = drawScaled(bmp, OUT_MAX_PX);
  if ("close" in bmp) bmp.close();
  return c;
}

export type Analysis = QualityMetrics & { clippedLow: number; hash: string };

/** Quality metrics computed on a 320-px-wide copy (fast, resolution-independent). */
export function analyzeCanvas(full: HTMLCanvasElement): Analysis {
  const small = drawScaled(full, ANALYSIS_W);
  const { width: w, height: h } = small;
  const data = small.getContext("2d")!.getImageData(0, 0, w, h).data;
  const gray = toGray(data);
  const e = exposure(gray);
  return {
    w: full.width,
    h: full.height,
    mean: e.mean,
    clippedHigh: e.clippedHigh,
    clippedLow: e.clippedLow,
    sharp: sharpness(gray, w, h),
    hash: dHash(gray, w, h),
  };
}

export function toJpegDataUrl(c: HTMLCanvasElement): string {
  return c.toDataURL("image/jpeg", JPEG_QUALITY);
}
