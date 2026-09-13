"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/intake/question-fields";
import { AcuityPad } from "@/components/intake/acuity-pad";
import { isCode, join, type ChartMsg, type JoinStatus } from "@/lib/acuity-pairing";

export function RemotePad() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  // Autofill / iOS one-time-code paste can set the field without onChange.
  const codeRef = useRef<HTMLInputElement>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const [status, setStatus] = useState<JoinStatus>("connecting");
  const [detail, setDetail] = useState("");
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ok = status === "connected";
  const [state, setState] = useState<ChartMsg | null>(null);
  const [conn, setConn] = useState<ReturnType<typeof join> | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code") ?? "";
    if (isCode(c)) {
      setCode(c);
      setJoined(c);
    }
  }, []);

  useEffect(() => {
    if (!joined) return;
    setStatus("connecting");
    setDetail("");
    setSlow(false);
    const c = join(joined, {
      chart: setState,
      status: (st, d) => {
        setStatus(st);
        setDetail(d ?? "");
      },
    });
    setConn(c);
    const t = setTimeout(() => setSlow(true), 8000);
    return () => {
      clearTimeout(t);
      c.close();
      setConn(null);
    };
  }, [joined, attempt]);

  // Re-announce while no chart is live (chart page reloaded or not open yet).
  useEffect(() => {
    if (!conn || !ok || (state && state.phase !== "done")) return;
    const t = setInterval(() => conn.send({ type: "hello" }), 3000);
    return () => clearInterval(t);
  }, [conn, ok, state]);

  if (!joined) {
    return (
      <Panel>
        <h1 className="text-2xl">Eye test remote</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code shown on the screen running the eye test.
        </p>
        <form
          className="mt-6 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const raw = (codeRef.current?.value ?? code).replace(/\D/g, "");
            if (isCode(raw)) {
              setCode(raw);
              setJoined(raw);
            } else {
              setCodeError("Enter the 6-digit code shown on the other screen.");
            }
          }}
        >
          <Input
            ref={codeRef}
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              setCodeError("");
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            }}
            className="font-mono text-lg tracking-[0.3em]"
            aria-label="Pairing code"
          />
          <Button type="submit" className="bg-cta text-cta-foreground hover:bg-cta-hover">
            Join
          </Button>
        </form>
        {codeError ? <p className="mt-2 text-sm text-triage-urgent-fg">{codeError}</p> : null}
      </Panel>
    );
  }

  const testing = state?.phase === "testing";
  const near = state?.test === "near";
  const target = state?.targetCm ? (state.targetCm >= 100 ? `${(state.targetCm / 100).toFixed(0)} m` : `${state.targetCm} cm`) : null;
  const outOfRange = !!state?.hint && !/good$/.test(state.hint) && !/^No camera|^Starting/.test(state.hint);
  const eyeLabel = state?.eye === "right" ? "Right" : "Left";
  const coverLabel = state?.eye === "right" ? "left" : "right";
  return (
    <Panel>
      <p className="font-mono text-xs text-muted-foreground">
        Code {joined} · {ok ? "connected" : status === "error" ? "connection failed" : "connecting…"}
      </p>
      {state && state.phase !== "done" && target ? (
        <p className="mt-3 inline-flex rounded-full bg-primary-subtle px-3 py-1 text-sm font-medium text-primary">
          {near ? `Reading test · hold the screen ${target} away` : `Distance test · stand ${target} from the screen`}
        </p>
      ) : null}
      {state && state.phase !== "done" && state.hint ? (
        <p className={`mt-3 rounded-[var(--radius-md)] border p-3 text-base ${outOfRange ? "border-triage-review bg-triage-review-bg font-medium text-triage-review-fg" : "border-border text-muted-foreground"}`}>
          {state.hint}
        </p>
      ) : null}
      {!ok && (slow || status === "error") ? (
        <div className="mt-3 rounded-[var(--radius-md)] border border-triage-review bg-triage-review-bg p-3 text-sm text-triage-review-fg">
          <p>
            {status === "error"
              ? `Couldn't reach the pairing service${detail ? ` (${detail})` : ""}.`
              : "Still connecting. This phone needs internet access, and the code must match the one on the other screen right now."}
          </p>
          <div className="mt-2 flex gap-3">
            <Button size="sm" variant="outline" onClick={() => setAttempt((a) => a + 1)}>
              Retry
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setJoined(null)}>
              Change code
            </Button>
          </div>
        </div>
      ) : null}
      <h1 className="mt-2 text-2xl">
        {state?.phase === "done"
          ? "Eye test finished"
          : state
            ? `${near ? "Reading · " : ""}${eyeLabel} eye${testing ? ` · ${state.snellen} · E ${state.index + 1} of ${state.total}` : " · get ready"}`
            : "Waiting for the chart…"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {state?.phase === "done"
          ? "Go back to the other screen to continue."
          : testing
            ? `Cover your ${coverLabel} eye. Tap the direction the E on the screen points.`
            : ok
              ? state?.startLabel
                ? "Get in position, then press Start below."
                : near
                  ? "Reading test next: hold the other screen 40 cm from your eyes."
                  : "Connected. Get into position — Start appears here when you're at the right distance."
              : "Connecting to the screen running the test…"}
      </p>
      {!testing && state?.startLabel && conn ? (
        <Button
          className="mt-6 h-12 w-full bg-cta text-base text-cta-foreground hover:bg-cta-hover"
          onClick={() => conn.send({ type: "start" })}
        >
          {state.startLabel}
        </Button>
      ) : null}
      <div className="mt-8">
        <AcuityPad disabled={!testing || !conn} onAnswer={(dir) => conn?.send({ type: "answer", dir })} />
      </div>
      <Button variant="ghost" size="sm" className="mt-6 text-muted-foreground" onClick={() => setJoined(null)}>
        Use a different code
      </Button>
    </Panel>
  );
}
