/**
 * Phone-as-remote pairing over Supabase Realtime broadcast (no tables).
 * The chart device hosts and owns the exam; the phone only sends answers.
 */
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { DIRS } from "@/lib/acuity";

export const RemoteMsgSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hello") }),
  z.object({ type: z.literal("answer"), dir: z.enum([...DIRS, "cant"]) }),
  /** Phone pressed Start on a waiting screen. */
  z.object({ type: z.literal("start") }),
]);
export type RemoteMsg = z.infer<typeof RemoteMsgSchema>;

export const ChartMsgSchema = z.object({
  type: z.literal("state"),
  eye: z.enum(["right", "left"]),
  phase: z.enum(["waiting", "testing", "done"]),
  /** Which part of the exam the chart is on; older charts omit it (= distance). */
  test: z.enum(["distance", "near"]).optional(),
  /** Required viewing distance for the current test. */
  targetCm: z.number().optional(),
  /** Live distance guidance for the patient ("Move 60 cm further back"). */
  hint: z.string().optional(),
  /** Label of the Start button the chart is waiting on, if any. */
  startLabel: z.string().optional(),
  snellen: z.string(),
  index: z.number().int(),
  total: z.number().int(),
});
export type ChartMsg = z.infer<typeof ChartMsgSchema>;

export function newCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isCode(s: string): boolean {
  return /^\d{6}$/.test(s);
}

function open(code: string) {
  return createClient().channel(`acuity:${code}`, {
    config: { broadcast: { self: false } },
  });
}

/** Chart device side. */
export function host(
  code: string,
  on: { remote: (m: RemoteMsg) => void; status: (ok: boolean) => void },
) {
  const ch = open(code);
  // A closed host must not report late CLOSED/ERROR states over a newer host.
  let closed = false;
  ch.on("broadcast", { event: "remote" }, ({ payload }) => {
    if (closed) return;
    const p = RemoteMsgSchema.safeParse(payload);
    if (p.success) on.remote(p.data);
  }).subscribe((st) => {
    if (!closed) on.status(st === "SUBSCRIBED");
  });
  return {
    send: (m: ChartMsg) => ch.send({ type: "broadcast", event: "chart", payload: m }),
    close: () => {
      closed = true;
      void ch.unsubscribe();
    },
  };
}

/** Phone side. */
export type JoinStatus = "connecting" | "connected" | "error";

export function join(
  code: string,
  on: { chart: (m: ChartMsg) => void; status: (st: JoinStatus, detail?: string) => void },
) {
  const ch = open(code);
  ch.on("broadcast", { event: "chart" }, ({ payload }) => {
    const p = ChartMsgSchema.safeParse(payload);
    if (p.success) on.chart(p.data);
  }).subscribe((st, err) => {
    if (st === "SUBSCRIBED") {
      on.status("connected");
      void ch.send({ type: "broadcast", event: "remote", payload: { type: "hello" } });
    } else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT" || st === "CLOSED") {
      on.status("error", err?.message ?? st);
    } else {
      on.status("connecting");
    }
  });
  return {
    send: (m: RemoteMsg) => ch.send({ type: "broadcast", event: "remote", payload: m }),
    close: () => ch.unsubscribe(),
  };
}
