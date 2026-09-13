"use client";

import { useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { distanceHint, startMeter, type GuardState, type MeterStatus, type Sample } from "@/lib/distance-meter";

export { distanceHint };
export type { GuardState };
import { cn } from "@/lib/utils";

/** Hidden camera element that streams landmark samples (~6/s) while enabled. */
export function DistanceMeter({
  enabled,
  onSample,
  onStatus,
  preview,
}: {
  enabled: boolean;
  onSample: (s: Sample | null) => void;
  onStatus: (st: MeterStatus | "off") => void;
  /** Show a small live preview (calibration step). */
  preview?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cbRef = useRef({ onSample, onStatus });
  useEffect(() => {
    cbRef.current = { onSample, onStatus };
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;
    cbRef.current.onStatus("starting");
    let last = 0;
    const stop = startMeter({
      video,
      onStatus: (st) => cbRef.current.onStatus(st),
      onSample: (s) => {
        const now = performance.now();
        if (now - last < 160) return; // ~6 samples/s is plenty for a distance guard
        last = now;
        cbRef.current.onSample(s);
      },
    });
    return () => {
      stop();
      cbRef.current.onStatus("off");
    };
  }, [enabled]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      aria-hidden
      className={cn(
        preview
          ? "mx-auto block w-40 rounded-[var(--radius-md)] border border-border"
          : "pointer-events-none fixed -left-[9999px] top-0 size-px opacity-0",
      )}
      style={{ transform: "scaleX(-1)" }}
    />
  );
}

/** Small status badge for the chart header. */
export function DistanceBadge({ state, targetCm, dark }: { state: GuardState; targetCm: number; dark?: boolean }) {
  const base = cn(
    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-xs",
    dark ? "border-neutral-300" : "border-border",
  );
  if (state.kind === "off") return null;
  if (state.kind === "no-camera")
    return (
      <span className={base} title="No camera — distance by ruler">
        <CameraOff className="size-3.5" /> ruler
      </span>
    );
  if (state.kind === "starting")
    return (
      <span className={base}>
        <Camera className="size-3.5" /> starting…
      </span>
    );
  if (state.kind === "no-face")
    return (
      <span className={base}>
        <Camera className="size-3.5" /> face not found
      </span>
    );
  return (
    <span
      className={cn(base, state.ok ? "text-triage-normal-fg" : "text-triage-urgent-fg")}
      title={`Target ${targetCm} cm`}
    >
      <Camera className="size-3.5" /> {state.cm.toFixed(0)} cm {state.ok ? "✓" : state.cm > targetCm ? "too far" : "too close"}
    </span>
  );
}
