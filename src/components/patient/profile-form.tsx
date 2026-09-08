"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fmtDate, type PatientProfile } from "@/lib/mock/patient";
import { updateProfile } from "@/lib/db/client-api";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[--radius-lg] border border-border bg-surface p-5">
      <h2 className="font-heading text-base font-semibold text-heading">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ProfileForm({ profile }: { profile: PatientProfile }) {
  const [name, setName] = useState(profile.name);
  const [notify, setNotify] = useState(profile.notify);
  const [diabetes, setDiabetes] = useState(profile.diabetes);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await updateProfile({
      full_name: name,
      diabetes,
      notify_whatsapp: notify.whatsapp,
      notify_sms: notify.sms,
      notify_email: notify.email,
    });
    setSaving(false);
    if (res.ok) toast.success("Profile saved");
    else toast.error(res.error ?? "Couldn't save");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile & consent"
        description="Your details, how we reach you, and what you've consented to."
      />

      <Card title="Personal details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" defaultValue={profile.phone} disabled />
            <span className="text-xs text-muted-foreground">Verify to change</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={profile.email} disabled />
            <span className="text-xs text-muted-foreground">Verify to change</span>
          </div>
        </div>
      </Card>

      <Card
        title="Health context"
        description="Used to set your personalized recall date. You can change this anytime."
      >
        <div className="flex max-w-xs flex-col gap-1.5">
          <Label htmlFor="diabetes">Do you have diabetes?</Label>
          <Select value={diabetes} onValueChange={(v) => setDiabetes(v as typeof diabetes)}>
            <SelectTrigger id="diabetes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="unknown">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card
        title="Notification preferences"
        description="How we send booking confirmations, prescriptions and recall reminders."
      >
        <div className="flex flex-col divide-y divide-border">
          {(
            [
              ["whatsapp", "WhatsApp"],
              ["sms", "SMS"],
              ["email", "Email"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <Label htmlFor={`n-${key}`} className="font-normal">
                {label}
              </Label>
              <Switch
                id={`n-${key}`}
                checked={notify[key]}
                onCheckedChange={(v) => setNotify((n) => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Consent records"
        description="What you've agreed to and when. You can withdraw consent for data processing."
      >
        <ul className="flex flex-col divide-y divide-border">
          {profile.consents.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-foreground">{c.label}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Granted {fmtDate(c.grantedAt)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast("Consent withdrawal requested")}>
                Withdraw
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title="Your data"
        description="Export a copy of your data, or delete your account entirely (DPDP)."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast("Data export requested — we'll email a link")}>
            Request data export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete my account & data</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently removes your profile, intake data and eye
                  photos. Consultation records we&apos;re legally required to keep
                  are retained in anonymised form. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep my account</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => toast("Account deletion requested")}
                  >
                    Delete everything
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-cta text-cta-foreground hover:bg-cta-hover"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
