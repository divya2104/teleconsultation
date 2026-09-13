"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/intake/question-fields";
import { CARD_MM } from "@/lib/acuity";

const CARD_H_MM = 53.98;
const MIN_PX_PER_MM = 2;
const MAX_PX_PER_MM = 25;

/** Card-on-screen scale calibration, then a 10 cm verify bar. */
export function AcuityCalibrate({
  initialPxPerMm,
  onDone,
}: {
  initialPxPerMm?: number;
  onDone: (pxPerMm: number) => void;
}) {
  const [max, setMax] = useState(600);
  const [width, setWidth] = useState(initialPxPerMm ? initialPxPerMm * CARD_MM : 320);
  const [verify, setVerify] = useState(false);

  useEffect(() => {
    const m = Math.min(window.innerWidth - 64, 1000);
    setMax(m);
    setWidth((w) => Math.min(w, m));
  }, []);

  const pxPerMm = width / CARD_MM;
  const plausible = pxPerMm >= MIN_PX_PER_MM && pxPerMm <= MAX_PX_PER_MM;

  if (verify) {
    const barPx = 100 * pxPerMm;
    return (
      <Panel>
        <h1 className="text-2xl">Check the scale</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This bar should measure exactly <strong>10 cm</strong>. Check it with a
          ruler, or lay your card along it: the card&apos;s long edge should end
          just past the 8.5 mark.
        </p>
        <div className="mt-6 overflow-x-auto">
          <div className="relative h-10 border-b-2 border-heading" style={{ width: barPx }}>
            {Array.from({ length: 11 }, (_, i) => (
              <span
                key={i}
                className="absolute bottom-0 border-l border-heading"
                style={{ left: i * pxPerMm * 10, height: i % 5 === 0 ? 20 : 10 }}
              >
                <span className="absolute -left-1.5 -top-5 font-mono text-[10px] text-muted-foreground">
                  {i}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
            onClick={() => onDone(pxPerMm)}
          >
            Yes, it&apos;s 10 cm
          </Button>
          <Button variant="outline" onClick={() => setVerify(false)}>
            Adjust again
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <h1 className="text-2xl">Match a card to the screen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hold any debit, credit, Aadhaar or PAN card flat against the screen and
        move the slider until the outline is exactly the card&apos;s size. This
        tells us your screen&apos;s real dimensions.
      </p>
      <div className="mt-6 flex justify-center overflow-hidden">
        <div
          aria-hidden
          className="rounded-[10px] border-2 border-dashed border-primary bg-primary-subtle/40"
          style={{ width, height: width * (CARD_H_MM / CARD_MM) }}
        />
      </div>
      <label className="mt-6 block">
        <span className="text-sm font-medium text-heading">Card width</span>
        <input
          type="range"
          min={150}
          max={max}
          step={1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
          aria-label="Card width"
        />
      </label>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {pxPerMm.toFixed(2)} px/mm
        {!plausible ? " — that doesn't look like a card; try again" : ""}
      </p>
      <Button
        className="mt-6 bg-cta text-cta-foreground hover:bg-cta-hover"
        disabled={!plausible}
        onClick={() => setVerify(true)}
      >
        The outline matches my card
      </Button>
    </Panel>
  );
}
