"use client";

import { useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The dark video frame + call controls, shared by the patient and doctor
 * consult rooms. Media is mocked — this is layout + control state only.
 */
export function CallStage({
  mainLabel,
  selfLabel = "You",
  banner,
  onLeave,
}: {
  mainLabel: string;
  selfLabel?: string;
  banner?: React.ReactNode;
  onLeave: () => void;
}) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  return (
    <div className="overflow-hidden rounded-[--radius-lg] border border-border bg-slate-900">
      {banner ? (
        <div className="bg-triage-review-bg px-4 py-2 text-center text-xs font-medium text-triage-review-fg">
          {banner}
        </div>
      ) : null}
      <div className="relative flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#1e293b,#0f172a)]">
        <p className="font-mono text-xs text-slate-400">
          {cam ? mainLabel : "Camera off"}
        </p>
        <div className="absolute bottom-3 right-3 grid h-20 w-32 place-items-center rounded-[--radius-sm] border border-slate-700 bg-slate-800 font-mono text-[10px] text-slate-500">
          {selfLabel}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 bg-slate-900 p-3">
        <button
          onClick={() => setMic((m) => !m)}
          className={cn(
            "grid size-10 place-items-center rounded-full text-slate-200",
            mic ? "bg-slate-700 hover:bg-slate-600" : "bg-destructive",
          )}
          aria-label={mic ? "Mute" : "Unmute"}
        >
          {mic ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </button>
        <button
          onClick={() => setCam((c) => !c)}
          className={cn(
            "grid size-10 place-items-center rounded-full text-slate-200",
            cam ? "bg-slate-700 hover:bg-slate-600" : "bg-destructive",
          )}
          aria-label={cam ? "Turn camera off" : "Turn camera on"}
        >
          {cam ? <VideoIcon className="size-4" /> : <VideoOff className="size-4" />}
        </button>
        <button
          onClick={onLeave}
          className="grid size-10 place-items-center rounded-full bg-destructive text-white"
          aria-label="Leave call"
        >
          <PhoneOff className="size-4" />
        </button>
      </div>
    </div>
  );
}
