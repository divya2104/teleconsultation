"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { readDraft, writeDraft } from "@/lib/intake-store";

const SHOTS = [
  "Straight-on, both eyes open",
  "Close-up of the right eye",
  "Close-up of the left eye",
];

export function Photos() {
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = readDraft();
    setConsent(d.photoConsent);
    setPhotos(d.photos ?? []);
  }, []);

  const addPhoto = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const next = [...photos, url].slice(0, 3);
    setPhotos(next);
    writeDraft({ photos: next });
  };

  const removePhoto = (i: number) => {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    writeDraft({ photos: next });
  };

  if (!consent) {
    return (
      <div>
        <h1 className="text-2xl">Consent for eye photos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The next step captures 2–3 photos of your eyes.
        </p>
        <div className="mt-6 rounded-[--radius-lg] border border-border bg-surface p-5 text-sm text-muted-foreground-strong">
          <ul className="space-y-2">
            <li>Photos are used only to help your doctor screen for visible signs.</li>
            <li>They are encrypted, access is limited and logged, and they are never used to train third-party models.</li>
            <li>You can withdraw consent and delete your data later from your profile.</li>
          </ul>
        </div>
        <label className="mt-5 flex items-start gap-3 rounded-[--radius-md] border border-border p-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            onChange={(e) => {
              setConsent(e.target.checked);
              writeDraft({ photoConsent: e.target.checked });
            }}
          />
          I consent to ClearSight collecting and processing my eye photos and
          related health data for this consultation (DPDP Act).
        </label>
        <NavButtons step="photos" canContinue={false} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl">Capture your eye photos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow the guide for each shot. You can retake any photo.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {SHOTS.map((label, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-[--radius-lg] border border-border bg-surface"
          >
            <div className="relative aspect-square bg-surface-muted">
              {photos[i] ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[i]}
                    alt={label}
                    className="size-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-surface/90 text-muted-foreground shadow-sm hover:text-heading"
                    aria-label="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <Camera className="size-7" strokeWidth={1.5} />
                </div>
              )}
              {/* framing guide overlay */}
              <div className="pointer-events-none absolute inset-4 rounded-full border-2 border-dashed border-border-brand" />
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (photos[i]) removePhoto(i);
                  fileRef.current?.click();
                }}
              >
                {photos[i] ? "Retake" : "Add"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          addPhoto(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-primary" />
        Screening aid only — the doctor makes every clinical call.
      </p>

      <NavButtons step="photos" canContinue={photos.length >= 2} />
    </div>
  );
}
