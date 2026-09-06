import { PageHeader } from "@/components/layout/page-header";
import { Tile } from "@/components/common/tile";
import { QueueRow } from "@/components/doctor/queue-row";
import { EmptyState } from "@/components/common/empty-state";
import { CalendarDays } from "lucide-react";
import { queue, todayTiles } from "@/lib/mock/doctor";

export const metadata = { title: "Doctor dashboard" };

export default function Page() {
  const t = todayTiles();
  const today = queue
    .filter((q) => new Date(q.slot).toDateString() === new Date().toDateString())
    .sort((a, b) => +new Date(a.slot) - +new Date(b.slot));
  const upcoming = today.filter((q) => q.status === "upcoming" || q.status === "live");
  const attention = upcoming.filter((q) => q.triage === "urgent" || q.inconclusiveAI);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Today"
        description={new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Scheduled" value={t.scheduled} />
        <Tile label="Completed" value={t.completed} />
        <Tile label="No-shows" value={t.noShows} hint="last 7 days" />
        <Tile
          label="Next consult"
          value={t.nextInMin === null ? "—" : `${t.nextInMin}m`}
          hint={t.nextInMin === null ? "nothing upcoming" : "from now"}
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
