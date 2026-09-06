import Link from "next/link";
import { Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/common/triage-badge";
import { StatusPill } from "@/components/common/status-pill";
import type { QueueItem } from "@/lib/mock/doctor";
import { cn } from "@/lib/utils";

export function QueueRow({ item }: { item: QueueItem }) {
  const time = new Date(item.slot).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  const joinable = item.status === "upcoming" || item.status === "live";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[--radius-lg] border bg-surface p-4 sm:flex-row sm:items-center",
        item.triage === "urgent" ? "border-triage-urgent/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted font-mono text-xs font-medium text-muted-foreground-strong">
          {item.patientInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-heading">
            {item.patientName}
          </p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {time} · {item.age}y
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TriageBadge state={item.triage} />
          {item.inconclusiveAI ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground-strong">
              <Sparkles className="size-3" />
              AI inconclusive
            </span>
          ) : null}
          {!item.paid ? (
            <span className="rounded-full bg-triage-review-bg px-2 py-0.5 text-xs text-triage-review-fg">
              Payment pending
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground-strong">{item.summary}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={item.status} />
        {joinable ? (
          <Button asChild size="sm" className="bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href={`/doctor/consult/${item.id}`}>
              <Video className="size-4" />
              Open
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={`/doctor/consult/${item.id}`}>View</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
