"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, ImageUp, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ANALYSIS_W,
  OUT_MAX_PX,
  analyzeCanvas,
  drawScaled,
  exposure,
  hasFail,
  judgeQuality,
  sharpness,
  toGray,
  toJpegDataUrl,
  type Finding,
} from "@/lib/photo-check";
import {
  getLandmarker,
  judgeShot,
  pixelReader,
  reportFromLandmarks,
  type Landmark,
  type Shot,
} from "@/lib/eye-check";

const GUIDE: Record<Shot, string> = {
  0: "Face the camera at arm's length, both eyes open",
  1: "Right eye, brow and cheek inside the circle",
  2: "Left eye, brow and cheek inside the circle",
};
const TICK_MS = 250;
const STEADY_TICKS = 4; // ~1 s of consecutive good frames before the countdown
const COUNTDOWN_FROM = 3;
const MODEL_WAIT_MS = 6000; // don't auto-capture blind while the landmarker loads

type Model = "loading" | "ready" | "failed";
type Landmarker = Awaited<ReturnType<typeof getLandmarker>>;

/** Full-screen viewfinder with framing guide, live checks and auto-capture. */
export function PhotoCamera({
  shot,
  onCapture,
  onCancel,
  onUseFile,
}: {
  shot: Shot;
  /** Only called for photos without hard failures; `warnings` are the soft ones. */
  onCapture: (dataUrl: string, warnings: Finding[], hash: string) => void;
  onCancel: () => void;
  onUseFile: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [status, setStatus] = useState<"starting" | "running" | "no-camera">("starting");
  const [canFlip, setCanFlip] = useState(false);
  const [model, setModel] = useState<Model>("loading");
  const [live, setLive] = useState<Finding[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejected, setRejected] = useState<Finding[] | null>(null);
  const landmarkerRef = useRef<Landmarker | null>(null);
  const lastLm = useRef<Landmark[] | undefined>(undefined);
  const steady = useRef(0);
  const captureRef = useRef<() => void>(() => {});

  // camera stream (restarts on flip)
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus("starting");
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setStatus("running");
        const devs = await navigator.mediaDevices.enumerateDevices();
        setCanFlip(devs.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        if (!cancelled) setStatus("no-camera");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facing]);

  // landmarker, best effort
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => alive && setModel((m) => (m === "loading" ? "failed" : m)), MODEL_WAIT_MS);
    getLandmarker("VIDEO")
      .then((l) => {
        if (!alive) return;
        landmarkerRef.current = l;
        setModel("ready");
      })
      .catch(() => alive && setModel("failed"));
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // live analysis loop
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2 || busy || countdown !== null || rejected) return;
      const small = drawScaled(v, ANALYSIS_W);
      const data = small.getContext("2d")!.getImageData(0, 0, small.width, small.height).data;
      const gray = toGray(data);
      const e = exposure(gray);
      const q = judgeQuality({
        w: v.videoWidth,
        h: v.videoHeight,
        mean: e.mean,
        clippedHigh: e.clippedHigh,
        sharp: sharpness(gray, small.width, small.height),
      });
      let lm: Landmark[] | undefined;
      try {
        lm = landmarkerRef.current?.detectForVideo(v, performance.now()).faceLandmarks?.[0];
      } catch {
        lm = undefined;
      }
      lastLm.current = lm;
      const shotF = landmarkerRef.current
        ? judgeShot(shot, reportFromLandmarks(lm, v.videoWidth, v.videoHeight), v.videoWidth)
        : [];
      const all = [...q, ...shotF];
      setLive(all);
      // Auto-capture waits for a clean frame: no hard failures and no framing advice.
      const good = model !== "loading" && all.length === 0;
      steady.current = good ? steady.current + 1 : 0;
      if (steady.current >= STEADY_TICKS) {
        steady.current = 0;
        setCountdown(COUNTDOWN_FROM);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [status, shot, busy, countdown, rejected, model]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      captureRef.current();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 700);
    return () => clearTimeout(t);
  }, [countdown]);

  const capture = useCallback(async () => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    setBusy(true);
    try {
      const full = drawScaled(v, OUT_MAX_PX);
      const a = analyzeCanvas(full);
      let lm = lastLm.current;
      try {
        lm = (await getLandmarker("IMAGE")).detect(full).faceLandmarks?.[0] ?? lm;
      } catch {
        /* keep the live landmarks */
      }
      const report = reportFromLandmarks(lm, full.width, full.height, pixelReader(full));
      const findings = [...judgeQuality(a), ...(model === "failed" && !lm ? [] : judgeShot(shot, report, full.width))];
      if (hasFail(findings)) {
        setRejected(findings.filter((f) => f.level === "fail"));
        return;
      }
      onCapture(toJpegDataUrl(full), findings.filter((f) => f.level === "warn"), a.hash);
    } finally {
      setBusy(false);
      setCountdown(null);
    }
  }, [shot, onCapture, model]);
  useEffect(() => {
    captureRef.current = () => void capture();
  }, [capture]);

  const fails = live.filter((f) => f.level === "fail");
  const warns = live.filter((f) => f.level === "warn");
  const mirrored = facing === "user";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label="Camera">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="font-medium">{GUIDE[shot]}</span>
        <button type="button" onClick={onCancel} aria-label="Close camera" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 size-full object-cover"
          style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
        />
        {/* framing guide */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px]"
          style={
            shot === 0
              ? { width: "62%", height: "72%", borderColor: fails.length ? "rgba(255,255,255,0.7)" : "#34d399" }
              : { width: "min(58vw, 58vh)", height: "min(58vw, 58vh)", borderColor: fails.length ? "rgba(255,255,255,0.7)" : "#34d399" }
          }
        />
        {countdown !== null ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="font-heading text-[96px] font-semibold drop-shadow">{countdown || <Check className="size-24" />}</span>
          </div>
        ) : null}
        {status === "no-camera" ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <Camera className="mx-auto size-8 opacity-70" />
              <p className="mt-3 text-sm">No camera available here. You can pick a photo instead — it is checked the same way.</p>
              <Button className="mt-4 bg-white text-black hover:bg-white/90" onClick={onUseFile}>
                <ImageUp className="size-4" /> Choose a photo
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 px-4 pb-6 pt-3">
        {rejected ? (
          <div className="rounded-[var(--radius-md)] bg-red-500/20 p-3 text-sm">
            <p className="font-medium">Not saved — please retake:</p>
            <ul className="mt-1 list-disc pl-5">{rejected.map((f) => <li key={f.code}>{f.message}</li>)}</ul>
            <Button size="sm" className="mt-3 bg-white text-black hover:bg-white/90" onClick={() => setRejected(null)}>
              Retake
            </Button>
          </div>
        ) : status === "running" ? (
          <div className="min-h-6 text-center text-sm">
            {fails.length ? (
              <span className="rounded-full bg-red-500/30 px-3 py-1">{fails[0].message}</span>
            ) : warns.length ? (
              <span className="rounded-full bg-amber-500/30 px-3 py-1">{warns[0].message}</span>
            ) : model === "loading" ? (
              <span className="text-white/70">Getting ready…</span>
            ) : (
              <span className="rounded-full bg-emerald-500/30 px-3 py-1">Looks good — hold still</span>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-white/70">{status === "starting" ? "Starting camera…" : ""}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          {canFlip ? (
            <button type="button" aria-label="Switch camera" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <RefreshCw className="size-5" />
            </button>
          ) : (
            <span className="size-12" />
          )}
          <button
            type="button"
            aria-label="Take photo"
            disabled={status !== "running" || busy}
            onClick={() => {
              setCountdown(null);
              void capture();
            }}
            className="grid size-[72px] place-items-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
          >
            <span className="size-14 rounded-full bg-white" />
          </button>
          <button type="button" aria-label="Choose a photo instead" onClick={onUseFile} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
            <ImageUp className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
