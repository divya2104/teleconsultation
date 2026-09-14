"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, CreditCard, Footprints, Loader2, Smartphone, Users } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/intake/nav-buttons";
import { Panel, PillGroup, StatTile } from "@/components/intake/question-fields";
import { AcuityCalibrate } from "@/components/intake/acuity-calibrate";
import { AcuityChart } from "@/components/intake/acuity-chart";
import { AcuityPad } from "@/components/intake/acuity-pad";
import { ScoreGauge } from "@/components/intake/score-gauge";
import {
  DistanceBadge,
  DistanceMeter,
  distanceHint,
  type GuardState,
} from "@/components/intake/acuity-distance-guard";
import {
  isSkipped,
  answer as reduce,
  currentLetterMm,
  currentLogMAR,
  distanceOffset,
  floorLogMAR,
  snellen,
  start,
  summary,
  toEyeResult,
  visible,
  type Answer,
  type DistanceCheck,
  type ExamState,
} from "@/lib/acuity";
import {
  CALIBRATION_SAMPLES,
  focalFromCapture,
  median,
  sampleToMm,
  smooth,
  type MeterStatus,
  type Method,
  type Sample,
  type Timed,
} from "@/lib/distance-meter";
import { host, newCode, type ChartMsg } from "@/lib/acuity-pairing";
import {
  readCalibration,
  readDraft,
  writeCalibration,
  writeDraft,
  type AcuityDraft,
  type Calibration,
} from "@/lib/intake-store";

type Eye = "right" | "left";
type Step =
  | { phase: "setup" }
  | { phase: "calibrate" }
  | { phase: "focal" }
  | { phase: "distance-setup" }
  | { phase: "distance"; eye: Eye; sub: "intro" | "testing" | "retest" }
  | { phase: "near-setup" }
  | { phase: "near"; eye: Eye; sub: "intro" | "testing" }
  | { phase: "done" };

const NEAR_MM = 400;
const RETEST_MM = 1000;
/** A lost face is tolerated this long before "face not found" (detectors drop frames constantly). */
const FACE_HOLD_MS = 2500;

const other = (e: Eye): Eye => (e === "right" ? "left" : "right");
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function resumeStep(d: AcuityDraft | undefined, cal: Calibration | null): Step {
  if (!d) return { phase: "setup" };
  if (d.skipped) return { phase: "done" };
  if (!d.correction || !d.mode || !d.meters || !cal) return { phase: "setup" };
  if (!d.distance?.right || !d.distance?.left) return { phase: "distance-setup" };
  if (!d.near?.right || !d.near?.left) return { phase: "near-setup" };
  return { phase: "done" };
}

export function Acuity() {
  const [draft, setDraft] = useState<AcuityDraft>({});
  const [cal, setCal] = useState<Calibration | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [exam, setExam] = useState<ExamState | null>(null);
  const [retest, setRetest] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [recommended, setRecommended] = useState<"helper" | "paired">("helper");
  // Dev on a LAN: the laptop page is often opened at localhost, which a phone
  // can't reach — NEXT_PUBLIC_REMOTE_ORIGIN overrides the host for the QR link.
  const remoteOrigin =
    process.env.NEXT_PUBLIC_REMOTE_ORIGIN ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const remoteHost = remoteOrigin.replace(/^https?:\/\//, "");

  // camera distance guard
  const [meter, setMeter] = useState<MeterStatus | "off">("off");
  const [reading, setReading] = useState<{ mm: number; method: Method; ok: boolean } | null>(null);
  const windowRef = useRef<Timed[]>([]);
  const lastFaceTs = useRef(0);
  const okRef = useRef(false);
  const samplesRef = useRef<{ mm: number; method: Method }[]>([]);
  const focalSamples = useRef<number[]>([]);
  const [focalCount, setFocalCount] = useState(0);
  const [capturing, setCapturing] = useState(false);

  // paired remote
  const [remoteOk, setRemoteOk] = useState(false);
  // Survives a laptop reload so the paired phone keeps working.
  const [code] = useState(() => {
    if (typeof window === "undefined") return newCode();
    const k = "clearsight.acuity.code";
    const saved = window.sessionStorage.getItem(k);
    if (saved && /^\d{6}$/.test(saved)) return saved;
    const c = newCode();
    window.sessionStorage.setItem(k, c);
    return c;
  });
  const hostRef = useRef<ReturnType<typeof host> | null>(null);
  const lastMsg = useRef<ChartMsg>({ type: "state", eye: "right", phase: "waiting", snellen: "", index: 0, total: 5 });

  useEffect(() => {
    const d = readDraft().acuity ?? {};
    const c = readCalibration();
    setDraft(d);
    setCal(c);
    setStep(resumeStep(d, c));
    setRecommended(window.innerWidth >= 768 ? "paired" : "helper");
    const vv = window.visualViewport;
    const check = () => setZoomed(!!vv && vv.scale > 1.01);
    check();
    vv?.addEventListener("resize", check);
    return () => vv?.removeEventListener("resize", check);
  }, []);

  const patch = useCallback((p: Partial<AcuityDraft> | ((d: AcuityDraft) => AcuityDraft)) => {
    setDraft((d) => {
      const next = typeof p === "function" ? p(d) : { ...d, ...p };
      writeDraft({ acuity: next });
      return next;
    });
  }, []);

  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const testing =
    !!step &&
    ((step.phase === "distance" && step.sub === "testing") ||
      (step.phase === "near" && step.sub === "testing"));
  const targetMm =
    step?.phase === "near" || step?.phase === "near-setup"
      ? NEAR_MM
      : retest || (step?.phase === "distance" && step.sub === "retest")
        ? RETEST_MM
        : (draft.meters ?? 3) * 1000;
  // Camera runs from the setup screens onward so the patient gets distance
  // guidance before pressing Start, not only once letters are on screen.
  const cameraOn =
    !!step &&
    (step.phase === "focal" ||
      step.phase === "distance-setup" ||
      step.phase === "distance" ||
      step.phase === "near-setup" ||
      step.phase === "near");

  // ---- camera samples ----
  const onSample = (s: Sample | null) => {
    const now = performance.now();
    if (!s) {
      // Hold the last smoothed reading briefly; detectors drop frames all the time.
      if (now - lastFaceTs.current > FACE_HOLD_MS) {
        windowRef.current = [];
        okRef.current = false;
        setReading(null);
      }
      return;
    }
    lastFaceTs.current = now;
    if (capturing) {
      focalSamples.current.push(s.irisPx);
      setFocalCount(focalSamples.current.length);
      return;
    }
    if (!cal?.focalPx) return;
    const r = sampleToMm(cal.focalPx, s);
    const sm = smooth(windowRef.current, { ...r, t: now }, targetMm, okRef.current);
    windowRef.current = sm.window;
    okRef.current = sm.ok;
    setReading({ mm: sm.mm, method: r.method, ok: sm.ok });
    if (testing) samplesRef.current.push(r);
  };

  useEffect(() => {
    if (capturing && focalCount >= CALIBRATION_SAMPLES) {
      const focalPx = focalFromCapture(focalSamples.current);
      writeCalibration({ focalPx });
      setCal(readCalibration());
      setCapturing(false);
      setStep({ phase: "distance-setup" });
    }
  }, [capturing, focalCount]);

  const guard: GuardState = useMemo(() => {
    if (!cameraOn || meter === "off") return { kind: "off" };
    if (meter === "no-camera" || meter === "error") return { kind: "no-camera" };
    if (meter === "starting") return { kind: "starting" };
    if (!reading) return { kind: "no-face" };
    return { kind: "reading", cm: reading.mm / 10, ok: reading.ok };
  }, [cameraOn, meter, reading, targetMm]);

  // Distance gates *starting* a test only, and only when a measurement says the
  // patient is out of range. During the test we warn and record, never block —
  // freezing the arrows every time the detector blinks made the test unusable.
  const gateOk = guard.kind !== "reading" || guard.ok;
  const hint = distanceHint(guard, targetMm / 10);
  const drifting = guard.kind === "reading" && !guard.ok;

  // ---- exam lifecycle ----
  const beginExam = useCallback(
    (distanceMm: number) => {
      if (!cal) return;
      samplesRef.current = [];
      setExam(
        start({
          distanceMm,
          floor: floorLogMAR(cal.pxPerMm, dpr, distanceMm),
          maxWidthMm: (window.innerWidth - 48) / cal.pxPerMm,
        }),
      );
    },
    [cal, dpr],
  );

  const onAnswer = useCallback(
    (a: Answer) => setExam((s) => (s && !s.terminated ? reduce(s, a) : s)),
    [],
  );

  const checkOf = (): DistanceCheck => {
    const xs = samplesRef.current;
    if (!xs.length) return { method: "none", samples: 0 };
    const iris = xs.filter((x) => x.method === "iris").length;
    return {
      method: iris * 2 >= xs.length ? "iris" : "ipd",
      meanCm: Math.round(median(xs.map((x) => x.mm)) / 10),
      samples: xs.length,
    };
  };

  useEffect(() => {
    if (!exam?.terminated || !step) return;
    if (step.phase === "distance") {
      if (exam.terminated === "belowRange" && !retest) {
        setExam(null);
        setStep({ ...step, sub: "retest" });
        return;
      }
      const nominal = (draft.meters ?? 3) * 1000;
      const res = toEyeResult(exam, {
        retestAt1m: retest,
        offset: retest ? distanceOffset(nominal, RETEST_MM) : 0,
      });
      const check = checkOf();
      patch((d) => ({ ...d, distance: { ...d.distance, [step.eye]: res, check } }));
      setStep(
        step.eye === "right"
          ? { phase: "distance", eye: "left", sub: "intro" }
          : { phase: "near-setup" },
      );
    } else if (step.phase === "near") {
      const res = toEyeResult(exam, { retestAt1m: false, offset: 0 });
      const check = checkOf();
      patch((d) => ({ ...d, near: { ...d.near, [step.eye]: res, check } }));
      setStep(step.eye === "right" ? { phase: "near", eye: "left", sub: "intro" } : { phase: "done" });
    }
    setExam(null);
    setRetest(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.terminated]);

  // ---- the "Start" the current screen is waiting on (buttons + phone remote share it) ----
  const paired = draft.mode === "paired";
  const startLabel = ((): string | null => {
    if (!step || !cal || !gateOk) return null;
    if (step.phase === "distance-setup") return zoomed || (paired && !remoteOk) ? null : "Start the distance test";
    if (step.phase === "near-setup") return paired && !remoteOk ? null : "Start the reading test";
    if ((step.phase === "distance" || step.phase === "near") && step.sub !== "testing") {
      return step.phase === "distance" && step.sub === "retest" ? "Start 1 m retest" : `Start · ${step.eye} eye`;
    }
    return null;
  })();
  /** The action behind the Start button of the current screen (buttons + phone share it). */
  const runStart = () => {
    if (!step || !cal || !startLabel) return;
    if (step.phase === "distance-setup") {
      setStep({ phase: "distance", eye: draft.distance?.right ? "left" : "right", sub: "intro" });
    } else if (step.phase === "near-setup") {
      setStep({ phase: "near", eye: draft.near?.right ? "left" : "right", sub: "intro" });
    } else if (step.phase === "distance" || step.phase === "near") {
      const isRetest = step.phase === "distance" && step.sub === "retest";
      if (isRetest) setRetest(true);
      beginExam(step.phase === "near" ? NEAR_MM : isRetest ? RETEST_MM : (draft.meters ?? 3) * 1000);
      setStep({ ...step, sub: "testing" });
    }
  };
  // Phone pressed Start: bump a counter, run the current screen's action in an effect.
  const [startRequests, setStartRequests] = useState(0);
  useEffect(() => {
    if (startRequests) runStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRequests]);
  const remoteActive =
    !!step &&
    (step.phase === "distance-setup" ||
      step.phase === "distance" ||
      step.phase === "near-setup" ||
      step.phase === "near");
  useEffect(() => {
    if (!paired || !remoteActive) return;
    const h = host(code, {
      // Our own subscription dropping means the phone is unreachable too.
      status: (ok) => !ok && setRemoteOk(false),
      remote: (m) => {
        if (m.type === "answer") {
          onAnswer(m.dir);
        } else if (m.type === "start") {
          setStartRequests((n) => n + 1);
        } else {
          setRemoteOk(true);
          hostRef.current?.send(lastMsg.current);
        }
      },
    });
    hostRef.current = h;
    return () => {
      h.send({ ...lastMsg.current, phase: "done" });
      h.close();
      hostRef.current = null;
    };
  }, [paired, remoteActive, code, onAnswer]);

  useEffect(() => {
    if (!paired || !step) return;
    const isNearPhase = step.phase === "near" || step.phase === "near-setup";
    if (step.phase !== "distance" && step.phase !== "distance-setup" && !isNearPhase) return;
    const eye: Eye =
      step.phase === "near-setup"
        ? draft.near?.right ? "left" : "right"
        : step.phase === "distance-setup"
          ? draft.distance?.right ? "left" : "right"
          : step.eye;
    const testing =
      (step.phase === "distance" || step.phase === "near") &&
      step.sub === "testing" &&
      !!exam &&
      !exam.terminated;
    const m: ChartMsg = {
      type: "state",
      eye,
      phase: testing ? "testing" : "waiting",
      test: isNearPhase ? "near" : "distance",
      targetCm: targetMm / 10,
      hint: hint || undefined,
      startLabel: startLabel ?? undefined,
      snellen: exam ? snellen(currentLogMAR(exam)) : "",
      index: exam?.answered.length ?? 0,
      total: 5,
    };
    lastMsg.current = m;
    hostRef.current?.send(m);
  }, [paired, step, exam, hint, targetMm, draft.near?.right, draft.distance?.right, startLabel]);

  if (!step) return null;

  /** Live distance badge + instruction, shown on every screen that runs the camera. */
  const distanceLine =
    guard.kind === "off" ? null : (
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <DistanceBadge state={guard} targetCm={targetMm / 10} />
        <span className={guard.kind === "reading" && !guard.ok ? "font-medium text-triage-review-fg" : "text-muted-foreground"}>
          {hint}
        </span>
      </div>
    );

  // ---------- chart overlay (testing) ----------
  if (testing && exam && cal) {
    const v = visible(exam);
    const eye = (step as Extract<Step, { phase: "distance" | "near" }>).eye;
    const letterPx = currentLetterMm(exam) * cal.pxPerMm;
    const isNear = step.phase === "near";
    const title = `${cap(eye)} eye · cover your ${other(eye)} eye · ${snellen(currentLogMAR(exam))}${retest ? " · at 1 m" : ""}`;
    return (
      <>
        <DistanceMeter enabled={cameraOn} onSample={onSample} onStatus={setMeter} />
        <AcuityChart
          shown={exam.shown}
          letterPx={letterPx}
          start={v.start}
          end={v.end}
          index={v.index}
          title={title}
          badge={<DistanceBadge state={guard} targetCm={targetMm / 10} dark />}
          onExit={() => {
            setExam(null);
            setRetest(false);
            setStep(isNear ? { phase: "near-setup" } : { phase: "distance-setup" });
          }}
          footer={
            paired ? (
              <p className="text-center text-sm text-neutral-600">
                {!remoteOk ? "Waiting for the phone remote…" : drifting ? hint : "Answer on your phone"}{" "}
                · code <span className="font-mono font-semibold text-neutral-900">{code}</span>
              </p>
            ) : (
              <AcuityPad
                dark
                onAnswer={onAnswer}
                hint={
                  drifting
                    ? hint
                    : isNear
                      ? "Which way does the E point?"
                      : "Helper: tap the direction the patient calls out"
                }
              />
            )
          }
        />
      </>
    );
  }

  // ---------- setup ----------
  if (step.phase === "setup") {
    const mode = draft.mode ?? recommended;
    const meters = draft.meters ?? 3;
    const ready = !!draft.correction;
    return (
      <>
        <Panel>
          <h1 className="text-3xl">Eye test</h1>
          <p className="mt-2 text-base text-muted-foreground">
            The same letter-chart test you&apos;d get at an eye clinic, done at home
            in about 10 minutes. It&apos;s a screening measure — your doctor confirms
            every result.
          </p>

          <h2 className="mt-8 text-sm font-semibold text-heading">How it works</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {(
              [
                { Icon: CreditCard, title: "1 · Set the scale", body: "Hold a bank card against the screen so the letters can be drawn at their true size." },
                { Icon: Footprints, title: `2 · Distance test, ${meters} m away`, body: "Letter E's appear on this screen. You say which way each one points. From 3 m you can't tap the screen, so a helper taps for you — or your phone becomes the remote." },
                { Icon: BookOpen, title: "3 · Reading test, 40 cm", body: "Same test with the device in your hand, tapping the arrows yourself." },
              ] as const
            ).map((o) => (
              <li key={o.title} className="rounded-[var(--radius-md)] border border-border bg-surface-muted/60 p-4">
                <o.Icon className="size-5 text-primary" strokeWidth={1.75} />
                <p className="mt-2 text-sm font-medium text-heading">{o.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.body}</p>
              </li>
            ))}
          </ol>

          <h2 className="mt-8 text-sm font-semibold text-heading">Do you wear glasses or contact lenses?</h2>
          <p className="mb-3 text-xs text-muted-foreground">Keep them on for the whole test.</p>
          <PillGroup
            ariaLabel="Correction"
            value={draft.correction ?? ""}
            onChange={(v) => patch({ correction: v as AcuityDraft["correction"] })}
            options={[
              { value: "glasses", label: "Glasses" },
              { value: "contacts", label: "Contact lenses" },
              { value: "none", label: "Neither" },
            ]}
          />

          <h2 className="mt-8 text-sm font-semibold text-heading">Who taps your answers in the distance test?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "helper", Icon: Users, title: "A helper holds this device", body: "A family member stands 3 m from you holding it at your eye level and taps the arrow you call out. Best on a phone." },
                { value: "paired", Icon: Smartphone, title: "My phone is the remote", body: "This screen shows the letters. You scan a QR code with your phone, and the phone shows four arrow buttons you tap yourself. Best on a laptop or TV." },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={mode === o.value}
                onClick={() => patch({ mode: o.value })}
                className={`relative flex items-start gap-3 rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  mode === o.value ? "border-primary bg-primary-subtle" : "border-border bg-surface hover:bg-surface-muted"
                }`}
              >
                <o.Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
                <span>
                  <span className="block text-sm font-medium text-heading">{o.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{o.body}</span>
                  {o.value === recommended ? (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Recommended for this device
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-sm font-semibold text-heading">Distance test: how far can you stand from the screen?</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            3 m is the standard; 2 m works in a small room. The 40 cm reading test
            follows automatically after the distance test.
          </p>
          <PillGroup
            ariaLabel="Test distance"
            value={String(meters)}
            onChange={(v) => patch({ meters: Number(v) as 3 | 2 })}
            options={[
              { value: "3", label: "3 metres" },
              { value: "2", label: "2 metres" },
            ]}
          />

          <p className="mt-8 rounded-[var(--radius-md)] bg-surface-muted p-3 text-xs text-muted-foreground">
            Your camera is used only on this device to check how far the screen is
            from your eyes. No video is recorded or uploaded.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              className="bg-cta text-cta-foreground hover:bg-cta-hover"
              disabled={!ready}
              onClick={() => {
                patch({ mode, meters });
                setStep(cal ? { phase: cal.focalPx ? "distance-setup" : "focal" } : { phase: "calibrate" });
              }}
            >
              Continue
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => {
                patch({ skipped: true });
                setStep({ phase: "done" });
              }}
            >
              I can&apos;t do this check
            </Button>
          </div>
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (step.phase === "calibrate") {
    return (
      <>
        <AcuityCalibrate
          initialPxPerMm={cal?.pxPerMm}
          onDone={(pxPerMm) => {
            writeCalibration({ pxPerMm });
            setCal(readCalibration());
            setStep({ phase: "focal" });
          }}
        />
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (step.phase === "focal") {
    const noCam = meter === "no-camera" || meter === "error";
    return (
      <>
        <Panel>
          <h1 className="text-2xl">Teach the camera 40 cm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One-time step. Hold the device exactly <strong>40 cm</strong> from your
            eyes — use a tape, or four lengths of this 10 cm ruler — then tap the
            button. From now on the camera can tell how far away you are.
          </p>
          <Ruler10 pxPerMm={cal?.pxPerMm ?? 4} />
          <div className="mt-6">
            <DistanceMeter enabled preview onSample={onSample} onStatus={setMeter} />
          </div>
          <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
            {meter === "starting" ? "Starting camera…" : noCam ? "No camera — distance will be checked with the ruler instead." : capturing ? `Measuring… ${focalCount}/${CALIBRATION_SAMPLES}` : reading === null && meter === "running" ? "Look at the screen" : "Camera ready"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-cta text-cta-foreground hover:bg-cta-hover"
              disabled={meter !== "running" || capturing}
              onClick={() => {
                focalSamples.current = [];
                setFocalCount(0);
                setCapturing(true);
              }}
            >
              I&apos;m at 40 cm
            </Button>
            <Button variant="outline" onClick={() => setStep({ phase: "distance-setup" })}>
              {noCam ? "Continue without camera" : "Skip"}
            </Button>
          </div>
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (step.phase === "distance-setup") {
    const m = draft.meters ?? 3;
    const go = () => runStart();
    const skipDistance = () => {
      patch((d) => ({
        ...d,
        distance: {
          right: d.distance?.right ?? { skipped: true },
          left: d.distance?.left ?? { skipped: true },
          check: d.distance?.check ?? { method: "none", samples: 0 },
        },
      }));
      setStep({ phase: "near-setup" });
    };
    const skipLink = (
      <button
        type="button"
        onClick={skipDistance}
        className="mt-4 block text-sm text-muted-foreground underline-offset-4 hover:text-heading hover:underline"
      >
        Can&apos;t do the distance test right now? Skip to the 40 cm reading test
      </button>
    );
    const prep = (
      <>
        <DistanceMeter enabled={cameraOn} onSample={onSample} onStatus={setMeter} />
        <h2 className="mt-8 text-sm font-semibold text-heading">Before you start</h2>
        <ol className="mt-3 space-y-2 text-sm text-foreground">
          <li>1. Turn screen brightness to maximum.{zoomed ? <strong className="text-triage-urgent-fg"> Reset browser zoom first (pinch out).</strong> : null}</li>
          <li>2. Stand {m} m from the screen — {m * 10} lengths of this ruler, or about {m === 3 ? "5" : "3–4"} standard 60 cm floor tiles.</li>
          <li>3. Keep your glasses on. You&apos;ll cover one eye at a time with your palm.</li>
        </ol>
        <Ruler10 pxPerMm={cal?.pxPerMm ?? 4} />
        {distanceLine}
      </>
    );

    if (paired) {
      const url = remoteOrigin ? `${remoteOrigin}/remote?code=${code}` : "";
      return (
        <>
          <Panel>
            <h1 className="text-2xl">Connect your phone</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your phone becomes the remote control: this screen shows the letters,
              your phone shows four arrow buttons.
            </p>
            <div className="mt-6 flex flex-col items-center gap-5 rounded-[var(--radius-md)] border border-border p-5 sm:flex-row sm:items-start">
              <QrImage url={url} />
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-heading">Scan this with your phone camera</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Or open <span className="font-mono text-heading">{url.replace(/^https?:\/\//, "").replace(/\?.*$/, "")}</span> and type the code:
                </p>
                <p className="mt-2 font-mono text-4xl font-semibold tracking-[0.2em] text-heading">{code}</p>
                <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${remoteOk ? "bg-triage-normal-bg text-triage-normal-fg" : "bg-surface-muted text-muted-foreground"}`}>
                  {remoteOk ? <Check className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
                  {remoteOk ? "Phone connected" : "Waiting for your phone…"}
                </p>
              </div>
            </div>
            {prep}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button className="bg-cta text-cta-foreground hover:bg-cta-hover" disabled={zoomed || !remoteOk || !gateOk} onClick={go}>
                {!remoteOk ? "Waiting for phone…" : !gateOk ? "Get into position to start" : "Start the distance test"}
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={() => patch({ mode: "helper" })}>
                No phone handy? Use a helper instead
              </Button>
            </div>
            {skipLink}
          </Panel>
          <NavButtons step="acuity" canContinue={false} />
        </>
      );
    }

    return (
      <>
        <Panel>
          <h1 className="text-2xl">Distance test · {m} m</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hand this device to your helper. They stand {m} m from you, hold it at
            your eye level, and tap the arrow you call out for each letter E.
          </p>
          {prep}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button className="bg-cta text-cta-foreground hover:bg-cta-hover" disabled={zoomed || !gateOk} onClick={go}>
              {!gateOk ? "Get into position to start" : "Start the distance test"}
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => patch({ mode: "paired" })}>
              Use my phone as the remote instead
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep({ phase: "calibrate" })}>
              Recalibrate screen
            </Button>
          </div>
          {skipLink}
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (step.phase === "distance" || step.phase === "near") {
    const isNear = step.phase === "near";
    const isRetest = step.phase === "distance" && step.sub === "retest";
    return (
      <>
        <Panel>
          <h1 className="text-2xl">
            {isRetest ? "Move to 1 m and try again" : `${cap(step.eye)} eye`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRetest
              ? "The largest letters weren't clear at this distance. Measure 1 m (ten ruler lengths) from the screen and read the same eye again."
              : `Cover your ${other(step.eye)} eye with your palm, keep both eyes open behind it, and read the E's with your ${step.eye} eye.`}
            {isNear ? " Hold the phone at 40 cm — the badge at the top turns green when you're there." : ""}
          </p>
          <DistanceMeter enabled={cameraOn} onSample={onSample} onStatus={setMeter} />
          {distanceLine}
          <Button
            className="mt-6 bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={!gateOk}
            onClick={() => runStart()}
          >
            {!gateOk ? "Get into position to start" : isRetest ? "Start 1 m retest" : "Start"}
          </Button>
          {paired ? (
            <p className="mt-3 text-xs text-muted-foreground">You can also press Start on your phone.</p>
          ) : null}
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  if (step.phase === "near-setup") {
    const floor = cal ? floorLogMAR(cal.pxPerMm, dpr, NEAR_MM) : 1;
    return (
      <>
        <Panel>
          <h1 className="text-2xl">Reading vision · 40 cm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Now hold this screen yourself at 40 cm — about elbow to knuckles. Put on
            reading glasses if you use them.{" "}
            {paired
              ? "Keep answering on your phone; the letters stay on this screen."
              : "You'll tap the direction of each E on this screen."}
          </p>
          {floor > 0.05 ? (
            <p className="mt-3 rounded-[var(--radius-md)] bg-surface-muted p-3 text-xs text-muted-foreground">
              This screen can&apos;t draw letters smaller than the {snellen(floor)} line
              at 40 cm, so the reading test stops there and is marked as a screen limit.
            </p>
          ) : null}
          <Ruler10 pxPerMm={cal?.pxPerMm ?? 4} />
          <DistanceMeter enabled={cameraOn} onSample={onSample} onStatus={setMeter} />
          {distanceLine}
          {paired ? (
            <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${remoteOk ? "bg-triage-normal-bg text-triage-normal-fg" : "bg-surface-muted text-muted-foreground"}`}>
              {remoteOk ? <Check className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
              {remoteOk ? "Phone connected" : <>Waiting for your phone · open <span className="font-mono">{remoteHost}/remote</span> and enter <span className="font-mono font-semibold text-heading">{code}</span></>}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              className="bg-cta text-cta-foreground hover:bg-cta-hover"
              disabled={(paired && !remoteOk) || !gateOk}
              onClick={() => runStart()}
            >
              {paired && !remoteOk ? "Waiting for phone…" : !gateOk ? "Get into position to start" : "Start"}
            </Button>
            {paired ? (
              <Button variant="ghost" className="text-muted-foreground" onClick={() => patch({ mode: "helper" })}>
                Tap on this screen instead
              </Button>
            ) : null}
          </div>
        </Panel>
        <NavButtons step="acuity" canContinue={false} />
      </>
    );
  }

  // ---------- done ----------
  const skippedAll = !!draft.skipped;
  return (
    <>
      <Panel>
        <h1 className="text-3xl">{skippedAll ? "Eye test skipped" : "Eye test complete"}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {skippedAll
            ? "No problem — your doctor will check your vision during the consult."
            : "Screening results — your doctor will confirm. * = limited by your screen."}
        </p>
        {!skippedAll ? (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Distance · {draft.meters} m</p>
            <div className="mt-3 flex flex-col gap-6">
              <ScoreGauge label="Right eye" mark="R" eye={draft.distance?.right} delayMs={300} />
              <ScoreGauge label="Left eye" mark="L" eye={draft.distance?.left} delayMs={2100} />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Reading · 40 cm</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <StatTile label="Right eye" value={summary(draft.near?.right)} />
              <StatTile label="Left eye" value={summary(draft.near?.left)} />
            </div>
            <ResultNotes draft={draft} />
          </>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-primary hover:text-primary"
          onClick={() => {
            patch(() => ({}));
            setStep({ phase: "setup" });
          }}
        >
          Redo the test
        </Button>
      </Panel>
      <NavButtons step="acuity" />
    </>
  );
}

/** Calibrated 10 cm ruler used to measure distances. */
function Ruler10({ pxPerMm }: { pxPerMm: number }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="relative h-7 border-b-2 border-heading" style={{ width: 100 * pxPerMm }}>
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className="absolute bottom-0 border-l border-heading"
            style={{ left: i * pxPerMm * 10, height: i % 5 === 0 ? 14 : 7 }}
          />
        ))}
        <span className="absolute -top-0.5 right-0 font-mono text-[10px] text-muted-foreground">10 cm</span>
      </div>
    </div>
  );
}

/** QR code for the phone-remote link, rendered on the client. */
function QrImage({ url }: { url: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { margin: 1, width: 176 }).then(setSrc).catch(() => setSrc(""));
  }, [url]);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="QR code to open the phone remote" className="size-44 shrink-0 rounded-[var(--radius-sm)] border border-border" />
  ) : (
    <div className="size-44 shrink-0 rounded-[var(--radius-sm)] border border-border bg-surface-muted" aria-hidden />
  );
}

/** Earned checks + a one-line, non-diagnostic reading of the two eyes. */
function ResultNotes({ draft }: { draft: AcuityDraft }) {
  const r = draft.distance?.right;
  const l = draft.distance?.left;
  const both = !!r && !!l && !isSkipped(r) && !isSkipped(l);
  const check = draft.distance?.check;
  const diff = both ? Math.round(Math.abs(r.logMAR - l.logMAR) * 100) / 100 : 0; // avoid 0.19999 < 0.2
  const weaker = both && diff >= 0.2 ? (r.logMAR > l.logMAR ? "right" : "left") : null;
  const lines = Math.round(diff / 0.1);
  return (
    <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm">
      {both ? (
        <p className="flex items-center gap-2.5">
          <Tick /> Both eyes tested at {draft.meters ?? 3} m
          {draft.correction && draft.correction !== "none" ? `, with ${draft.correction}` : ", unaided"}
        </p>
      ) : null}
      <p className="flex items-center gap-2.5">
        <Tick /> Screen calibrated
        {check && check.method !== "none" && check.meanCm ? ` · distance camera-checked at ${(check.meanCm / 100).toFixed(1)} m` : ""}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {weaker
          ? `Your ${weaker} eye reads ${lines} line${lines === 1 ? "" : "s"} below the other. That is worth showing a doctor — it is not a diagnosis.`
          : both
            ? "Both eyes read at a similar level. Your doctor confirms what this means for you."
            : "Your doctor will check the eye that was skipped during the consult."}
      </p>
    </div>
  );
}

function Tick() {
  return (
    <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-triage-normal-bg text-triage-normal-fg">
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}
