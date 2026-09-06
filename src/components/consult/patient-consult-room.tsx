"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Mic, Wifi, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallStage } from "@/components/consult/call-stage";
import { appointments, fmtDateTime } from "@/lib/mock/patient";

type Phase = "device-check" | "waiting" | "live" | "post";

export function PatientConsultRoom({ id }: { id: string }) {
  const router = useRouter();
  const appt = appointments.find((a) => a.id === id) ?? appointments[0];
  const [phase, setPhase] = useState<Phase>("device-check");
  const [degraded, setDegraded] = useState(false);

  // auto-advance from the waiting room after a beat
  useEffect(() => {
    if (phase !== "waiting") return;
    const t = setTimeout(() => setPhase("live"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "device-check") {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl">Ready to join?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {appt.doctorName} · {fmtDateTime(appt.start)}
        </p>
        <ul className="mt-6 flex flex-col gap-2">
          {[
            { icon: Camera, label: "Camera", ok: true },
            { icon: Mic, label: "Microphone", ok: true },
            { icon: Wifi, label: "Connection", ok: true },
          ].map(({ icon: Icon, label, ok }) => (
            <li
              key={label}
              className="flex items-center justify-between rounded-[--radius-md] border border-border bg-surface px-4 py-3"
            >
              <span className="flex items-center gap-3 text-sm text-foreground">
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </span>
              {ok ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-triage-normal-fg">
                  <Check className="size-3.5" strokeWidth={2.5} />
                  Ready
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
          onClick={() => setPhase("waiting")}
        >
          Join consultation
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          If video fails, we&apos;ll switch to audio-only automatically.
        </p>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none" />
        <h1 className="mt-5 text-2xl">Waiting for {appt.doctorName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          They&apos;ll join shortly. Keep this tab open.
        </p>
        <Button variant="ghost" className="mt-6" onClick={() => router.push("/dashboard")}>
          Leave
        </Button>
      </div>
    );
  }

  if (phase === "post") {
    return (
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-triage-normal-bg text-triage-normal-fg">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-2xl">Consultation complete</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Your prescription and any recall reminder will arrive on WhatsApp
          shortly, and are saved to this appointment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href={`/appointments/${appt.id}`}>View appointment</Link>
          </Button>
          <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href="/dashboard">Done</Link>
          </Button>
        </div>
      </div>
    );
  }

  // live
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <CallStage
        mainLabel={`${appt.doctorName} — connected`}
        banner={
          degraded
            ? "Weak connection — switched to audio-only. Your doctor can still hear you."
            : undefined
        }
        onLeave={() => setPhase("post")}
      />
      <div className="flex items-center justify-between">
        <button
          className="text-xs text-muted-foreground hover:text-heading"
          onClick={() => setDegraded((d) => !d)}
        >
          {degraded ? "Restore video" : "Simulate weak connection"}
        </button>
        {degraded ? (
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Reschedule instead
          </Button>
        ) : null}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" />
        Your prescription arrives on WhatsApp after the call.
      </p>
    </div>
  );
}
