import { BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Doctor profile" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
      <h2 className="font-heading text-base font-semibold text-heading">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Doctor profile" description="Your credentials and how patients see you." />

      <Card title="Verification">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-triage-normal-bg px-2.5 py-1 text-xs font-semibold text-triage-normal-fg">
            <BadgeCheck className="size-3.5" strokeWidth={2.5} />
            Verified
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            Reg. no. KMC/12345
          </span>
        </div>
      </Card>

      <Card title="Professional details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Dr. Anand Rao" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spec">Specialty</Label>
            <Input id="spec" defaultValue="General ophthalmology" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="langs">Languages</Label>
            <Input id="langs" defaultValue="English, Hindi, Kannada" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="bio">Display bio</Label>
          <Textarea
            id="bio"
            rows={3}
            defaultValue="18 years in comprehensive eye care. Special interest in dry eye and anterior segment."
          />
          <span className="text-xs text-muted-foreground">Shown to patients when they book.</span>
        </div>
      </Card>

      <Card title="Payout details">
        <p className="text-sm text-muted-foreground">
          Bank / UPI details and payout history arrive with the backend. For now,
          payouts are settled monthly by statement.
        </p>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-cta text-cta-foreground hover:bg-cta-hover">
          Save profile
        </Button>
      </div>
    </div>
  );
}
