"use client";

import { X } from "lucide-react";
import { DIRS, OPTOTYPES_PER_LINE, type Dir } from "@/lib/acuity";

const ROTATION: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };

/** Tumbling E on a 5×5 grid (stroke = 1/5). `px` is the letter height in CSS px. */
export function TumblingE({ dir, px }: { dir: Dir; px: number }) {
  return (
    <svg
      viewBox="0 0 5 5"
      width={px}
      height={px}
      shapeRendering="crispEdges"
      aria-hidden
      style={{ display: "block", flex: "none" }}
    >
      <g fill="#000" transform={`rotate(${ROTATION[dir]} 2.5 2.5)`}>
        <rect x="0" y="0" width="1" height="5" />
        <rect x="0" y="0" width="5" height="1" />
        <rect x="0" y="2" width="5" height="1" />
        <rect x="0" y="4" width="5" height="1" />
      </g>
    </svg>
  );
}

/**
 * Full-screen white chart: one line of optotypes at exact physical size.
 * Forced light regardless of theme — it is a clinical stimulus.
 */
export function AcuityChart({
  shown,
  letterPx,
  start,
  end,
  index,
  title,
  badge,
  footer,
  onExit,
}: {
  shown: Dir[];
  letterPx: number;
  start: number;
  end: number;
  index: number;
  title: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#fff", color: "#111" }}
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-3">
          {badge}
          <button
            type="button"
            onClick={onExit}
            aria-label="Stop the test"
            className="grid size-11 place-items-center rounded-full border border-neutral-300 hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4">
        <div className="flex items-start" style={{ gap: letterPx }}>
          {shown.slice(start, end).map((d, i) => {
            const k = start + i;
            return (
              <div key={k} className="flex flex-col items-center" style={{ gap: Math.max(6, letterPx * 0.4) }}>
                <TumblingE dir={d} px={letterPx} />
                <span
                  aria-hidden
                  style={{
                    width: Math.max(8, letterPx),
                    height: 3,
                    background: k === index ? "#0E7C86" : "transparent",
                    borderRadius: 2,
                  }}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          {index + 1} of {OPTOTYPES_PER_LINE}
          {end - start < OPTOTYPES_PER_LINE ? ` · showing ${end - start} at a time` : ""}
        </p>
      </div>

      {footer ? <div className="px-4 pb-6 pt-2">{footer}</div> : null}
    </div>
  );
}

export { DIRS };
