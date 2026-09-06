import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { patients } from "@/lib/mock/doctor";
import { fmtDate } from "@/lib/mock/patient";

export const metadata = { title: "Patients" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Patients"
        description="Everyone you've consulted on ClearSight."
      />
      <div className="overflow-hidden rounded-[--radius-lg] border border-border bg-surface">
        <ul className="divide-y divide-border">
          {patients.map((p) => (
            <li key={p.id}>
              <Link
                href={`/doctor/patients/${p.id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-muted"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted font-mono text-xs font-medium text-muted-foreground-strong">
                  {p.name.split(" ").map((s) => s[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-heading">
                    {p.name}{" "}
                    <span className="font-normal text-muted-foreground">· {p.age}y</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last seen {fmtDate(p.lastSeen)}
                    {p.flags.length ? ` · ${p.flags.join(", ")}` : ""}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
