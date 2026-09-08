"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CircleCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { Panel } from "@/components/intake/question-fields";
import { readDraft, writeDraft } from "@/lib/intake-store";

const SHOTS = [
  "Straight-on, both eyes open",
  "Close-up of the right eye",
  "Close-up of the left eye",
];

function CaptureCard({
  caption,
  photo,
  onCapture,
  onRemove,
}: {
  caption: string;
  photo?: string;
  onCapture: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div className="relative grid aspect-[4/3] place-items-center bg-surface-muted">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={caption}
              className="absolute inset-0 size-full object-cover"
            />
            <button
              onClick={onRemove}
              aria-label="Remove photo"
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-surface/90 text-muted-foreground shadow-sm hover:text-heading"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <span className="grid size-28 place-items-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
            <Camera className="size-6" strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 bg-surface p-4">
        <span className="min-w-0 text-sm text-muted-foreground-strong">
          {caption}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 rounded-full px-4 text-primary hover:text-primary"
          onClick={onCapture}
        >
          {photo ? "Retake" : "Capture"}
        </Button>
      </div>
    </div>
  );
}

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
      <>
        <Panel>
          <h1 className="text-3xl">Consent for eye photos</h1>
          <p className="mt-2 text-base text-muted-foreground">
            The next step captures 2–3 photos of your eyes.
          </p>
          <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface-muted p-5 text-sm text-muted-foreground-strong">
            <ul className="space-y-2">
              <li>
                Photos are used only to help your doctor screen for visible signs.
              </li>
              <li>
                They are encrypted, access is limited and logged, and they are
                never used to train third-party models.
              </li>
              <li>
                You can withdraw consent and delete your data later from your
                profile.
              </li>
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
            I consent to ClearSight collecting and processing my eye photos and
            related health data for this consultation (DPDP Act).
          </label>
        </Panel>
        <NavButtons step="photos" canContinue={false} />
      </>
    );
  }

  return (
    <>
      <Panel>
        <h1 className="text-3xl">Capture your eye photos</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Follow the guide for each shot. You can retake any photo.
        </p>

        <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-3">
          {SHOTS.map((label, i) => (
            <CaptureCard
              key={i}
              caption={label}
              photo={photos[i]}
              onCapture={() => {
                if (photos[i]) removePhoto(i);
                fileRef.current?.click();
              }}
              onRemove={() => removePhoto(i)}
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
            addPhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <p className="mt-5 flex items-center gap-2 text-sm text-primary">
          <CircleCheck className="size-4 shrink-0" />
          Screening aid only — the doctor makes every clinical call.
        </p>
      </Panel>

      <NavButtons step="photos" canContinue={photos.length >= 2} />
    </>
  );
}
