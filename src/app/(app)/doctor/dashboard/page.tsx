import { PageHeader } from "@/components/layout/page-header";
import { Tile } from "@/components/common/tile";
import { QueueRow } from "@/components/doctor/queue-row";
import { EmptyState } from "@/components/common/empty-state";
import { CalendarDays } from "lucide-react";
import { doctorQueue } from "@/lib/db/queries";

export const metadata = { title: "Doctor dashboard" };
export const dynamic = "force-dynamic";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export default async function Page() {
  const queue = await doctorQueue();
  const now = new Date();

  const today = queue
    .filter((q) => sameDay(new Date(q.slot), now))
    .sort((a, b) => +new Date(a.slot) - +new Date(b.slot));
  const upcoming = today.filter(
    (q) => q.status === "upcoming" || q.status === "live",
  );
  const attention = upcoming.filter(
    (q) => q.triage === "urgent" || q.inconclusiveAI,
  );
  const nextUpcoming = upcoming[0];
  const nextInMin = nextUpcoming
    ? Math.max(0, Math.round((+new Date(nextUpcoming.slot) - Date.now()) / 60000))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Today"
        description={now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Scheduled" value={today.length} />
        <Tile
          label="Completed"
          value={today.filter((q) => q.status === "completed").length}
        />
        <Tile
          label="No-shows"
          value={queue.filter((q) => q.status === "no-show").length}
          hint="all time"
        />
        <Tile
          label="Next consult"
          value={nextInMin === null ? "—" : `${nextInMin}m`}
          hint={nextInMin === null ? "nothing upcoming" : "from now"}
        />
      </div>

      {attention.length ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
            Needs attention before the call
          </h2>
          <div className="flex flex-col gap-3">
            {attention.map((q) => (
              <QueueRow key={q.id} item={q} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground-strong">
          Today&apos;s queue
        </h2>
        {upcoming.length ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((q) => (
              <QueueRow key={q.id} item={q} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No consults scheduled today"
            hint="Open availability to add more slots."
          />
        )}
      </section>
    </div>
  );
}
