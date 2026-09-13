"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Camera, CircleCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { Panel } from "@/components/intake/question-fields";
import { PhotoCamera } from "@/components/intake/photo-camera";
import { readDraft, writeDraft } from "@/lib/intake-store";
import { analyzeCanvas, decodeBlob, hamming, hasFail, judgeQuality, toJpegDataUrl, type Finding } from "@/lib/photo-check";
import { judgeShot, landmarksForCanvas, pixelReader, reportFromLandmarks, type Shot } from "@/lib/eye-check";

const SHOTS: { label: string; tip: string }[] = [
  { label: "Straight-on, both eyes open", tip: "Arm's length, face inside the oval" },
  { label: "Close-up of the right eye", tip: "Eye, brow and cheek inside the circle" },
  { label: "Close-up of the left eye", tip: "Eye, brow and cheek inside the circle" },
];
const DUPLICATE_BITS = 6;

function CaptureCard({
  shot,
  photo,
  warnings,
  onCapture,
  onRemove,
}: {
  shot: Shot;
  photo?: string;
  warnings: string[];
  onCapture: () => void;
  onRemove: () => void;
}) {
  const { label, tip } = SHOTS[shot];
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div className="relative grid aspect-[4/3] place-items-center bg-surface-muted">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={label} className="absolute inset-0 size-full object-cover" />
            <button
              onClick={onRemove}
              aria-label="Remove photo"
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-surface/90 text-muted-foreground shadow-sm hover:text-heading"
            >
              <X className="size-4" />
            </button>
            {warnings.length ? (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-triage-review-bg px-2 py-0.5 text-[11px] font-medium text-triage-review-fg">
                <AlertTriangle className="size-3" /> check
              </span>
            ) : (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-triage-normal-bg px-2 py-0.5 text-[11px] font-medium text-triage-normal-fg">
                <CircleCheck className="size-3" /> good
              </span>
            )}
          </>
        ) : (
          <span className="grid size-28 place-items-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
            <Camera className="size-6" strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 text-sm text-muted-foreground-strong">{label}</span>
          <Button size="sm" variant="outline" className="shrink-0 rounded-full px-4 text-primary hover:text-primary" onClick={onCapture}>
            {photo ? "Retake" : "Capture"}
          </Button>
        </div>
        {warnings.length ? (
          <ul className="space-y-1 text-xs text-triage-review-fg">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">{tip}</p>
        )}
      </div>
    </div>
  );
}

const EMPTY3 = ["", "", ""];

export function Photos() {
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<string[]>(EMPTY3);
  const [warnings, setWarnings] = useState<string[][]>([[], [], []]);
  const [hashes, setHashes] = useState<string[]>(EMPTY3);
  const [active, setActive] = useState<Shot | null>(null);
  const [fileShot, setFileShot] = useState<Shot | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = readDraft();
    setConsent(d.photoConsent);
    // Legacy drafts held blob: URLs, which do not survive a reload — drop them.
    const p = [0, 1, 2].map((i) => (d.photos?.[i]?.startsWith("data:") ? d.photos[i] : ""));
    setPhotos(p);
    setWarnings([0, 1, 2].map((i) => d.photoWarnings?.[i] ?? []));
    setHashes([0, 1, 2].map((i) => d.photoHashes?.[i] ?? ""));
  }, []);

  const save = (i: Shot, dataUrl: string, warns: Finding[], hash: string) => {
    const w = warns.map((f) => f.message);
    const dup = hashes.some((h, j) => j !== i && h && hamming(h, hash) <= DUPLICATE_BITS);
    if (dup) w.push("Looks the same as another photo — each slot should be a different shot.");
    const nextP = photos.map((p, j) => (j === i ? dataUrl : p));
    const nextW = warnings.map((x, j) => (j === i ? w : x));
    const nextH = hashes.map((h, j) => (j === i ? hash : h));
    setPhotos(nextP);
    setWarnings(nextW);
    setHashes(nextH);
    if (!writeDraft({ photos: nextP, photoWarnings: nextW, photoHashes: nextH })) {
      toast.error("Photo kept for now, but this browser's storage is full — don't refresh before submitting.");
    }
    setActive(null);
  };

  const remove = (i: number) => {
    const nextP = photos.map((p, j) => (j === i ? "" : p));
    const nextW = warnings.map((x, j) => (j === i ? [] : x));
    const nextH = hashes.map((h, j) => (j === i ? "" : h));
    setPhotos(nextP);
    setWarnings(nextW);
    setHashes(nextH);
    writeDraft({ photos: nextP, photoWarnings: nextW, photoHashes: nextH });
  };

  /** File-picker path: same checks as the viewfinder, on the chosen image. */
  const checkFile = async (i: Shot, file: File) => {
    try {
      const full = await decodeBlob(file);
      const a = analyzeCanvas(full);
      const lm = await landmarksForCanvas(full);
      const findings = [
        ...judgeQuality(a),
        ...(lm === null ? [] : judgeShot(i, reportFromLandmarks(lm, full.width, full.height, pixelReader(full)), full.width)),
      ];
      if (hasFail(findings)) {
        toast.error(findings.filter((f) => f.level === "fail").map((f) => f.message).join(" "));
        return;
      }
      save(i, toJpegDataUrl(full), findings.filter((f) => f.level === "warn"), a.hash);
    } catch (e) {
      toast.error((e as Error).message === "too-large" ? "That file is over 10 MB." : "Couldn't read that image — try another photo.");
    }
  };

  if (!consent) {
    return (
      <>
        <Panel>
          <h1 className="text-3xl">Consent for eye photos</h1>
          <p className="mt-2 text-base text-muted-foreground">The next step captures 2–3 photos of your eyes.</p>
          <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface-muted p-5 text-sm text-muted-foreground-strong">
            <ul className="space-y-2">
              <li>Photos are used only to help your doctor screen for visible signs.</li>
              <li>They are encrypted, access is limited and logged, and they are never used to train third-party models.</li>
              <li>You can withdraw consent and delete your data later from your profile.</li>
            </ul>
          </div>
          <label className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-border p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              onChange={(e) => {
                setConsent(e.target.checked);
                writeDraft({ photoConsent: e.target.checked });
              }}
            />
            I consent to ClearSight collecting and processing my eye photos and related health data for this consultation (DPDP Act).
          </label>
        </Panel>
        <NavButtons step="photos" canContinue={false} />
      </>
    );
  }

  const count = photos.filter(Boolean).length;

  return (
    <>
      {active !== null ? (
        <PhotoCamera
          shot={active}
          onCapture={(url, warns, hash) => save(active, url, warns, hash)}
          onCancel={() => setActive(null)}
          onUseFile={() => {
            setFileShot(active);
            setActive(null);
            fileRef.current?.click();
          }}
        />
      ) : null}
      <Panel>
        <h1 className="text-3xl">Capture your eye photos</h1>
        <p className="mt-2 text-base text-muted-foreground">
          The camera checks light, focus and framing and takes the photo when it looks good. You can retake any photo.
        </p>

        <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-3">
          {([0, 1, 2] as Shot[]).map((i) => (
            <CaptureCard
              key={i}
              shot={i}
              photo={photos[i] || undefined}
              warnings={warnings[i]}
              onCapture={() => setActive(i)}
              onRemove={() => remove(i)}
            />
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && fileShot !== null) void checkFile(fileShot, f);
            e.target.value = "";
          }}
        />

        <p className="mt-5 flex items-center gap-2 text-sm text-primary">
          <CircleCheck className="size-4 shrink-0" />
          Screening aid only — the doctor makes every clinical call.
        </p>
      </Panel>

      <NavButtons step="photos" canContinue={count >= 2} />
    </>
  );
}
