"use client";

import { useId, useRef, useState } from "react";

type Point = { date: string; value: number };

/**
 * Single-series time-series chart. area (line + fill + endpoint) or bar.
 * Recessive grid, direct-labelled endpoint, crosshair + tooltip on hover.
 * One series only — never a second axis (dataviz: no dual-axis).
 */
export function TrendChart({
  data,
  variant = "area",
  color = "var(--chart-1)",
  format = (n: number) => String(n),
  height = 190,
}: {
  data: Point[];
  variant?: "area" | "bar";
  color?: string;
  format?: (n: number) => string;
  height?: number;
}) {
  const W = 720;
  const H = height;
  const padX = 8;
  const padTop = 16;
  const padBottom = 22;
  const gid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const x = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1)},${padTop + innerH} L${x(0)},${padTop + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padTop + innerH * t);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - padX) / innerW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const last = data.length - 1;
  const active = hover ?? last;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((gy, i) => (
          <line
            key={i}
            x1={padX}
            x2={W - padX}
            y1={gy}
            y2={gy}
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}

        {variant === "area" ? (
          <>
            <path d={areaPath} fill={`url(#fill-${gid})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={x(last)} cy={y(data[last].value)} r={4} fill={color} />
          </>
        ) : (
          data.map((d, i) => {
            const bw = Math.max(2, innerW / data.length - 2);
            return (
              <rect
                key={i}
                x={x(i) - bw / 2}
                y={y(d.value)}
                width={bw}
                height={padTop + innerH - y(d.value)}
                rx={2}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
            );
          })
        )}

        {/* crosshair */}
        {hover !== null ? (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={padTop}
            y2={padTop + innerH}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ) : null}
        {hover !== null && variant === "area" ? (
          <circle cx={x(active)} cy={y(data[active].value)} r={4} fill={color} stroke="var(--surface)" strokeWidth={2} />
        ) : null}

        {/* x labels: first / mid / last */}
        {[0, Math.floor(last / 2), last].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
            className="fill-[var(--muted-foreground)] font-mono text-[11px]"
          >
            {new Date(data[i].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      <div
        className="pointer-events-none absolute top-0 rounded-[--radius-sm] border border-border bg-surface px-2.5 py-1.5 text-xs shadow-md transition-opacity"
        style={{
          left: `calc(${(x(active) / W) * 100}% )`,
          transform: "translateX(-50%)",
          opacity: hover === null ? 0 : 1,
        }}
      >
        <div className="font-mono text-[10px] text-muted-foreground">
          {new Date(data[active].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </div>
        <div className="font-medium tabular-nums text-heading">
          {format(data[active].value)}
        </div>
      </div>
    </div>
  );
}
