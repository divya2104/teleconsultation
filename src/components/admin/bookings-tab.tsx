"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/common/status-pill";
import { TriageBadge } from "@/components/common/triage-badge";
import { bookings } from "@/lib/mock/admin";
import { directory } from "@/lib/mock/admin";
import { cn } from "@/lib/utils";

const PAY_TONE: Record<string, string> = {
  paid: "text-triage-normal-fg",
  refunded: "text-muted-foreground",
  failed: "text-destructive",
};

export function BookingsTab() {
  const [status, setStatus] = useState("all");
  const [doctor, setDoctor] = useState("all");

  const rows = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (status === "all" || b.status === status) &&
          (doctor === "all" || b.doctor === doctor),
      ),
    [status, doctor],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={doctor} onValueChange={setDoctor}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All doctors</SelectItem>
            {directory.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-[--radius-lg] border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Triage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.ref}>
                <TableCell className="font-mono text-xs">{b.ref}</TableCell>
                <TableCell>{b.patient}</TableCell>
                <TableCell className="text-muted-foreground">{b.doctor}</TableCell>
                <TableCell className="font-mono text-xs tabular-nums">{b.slot}</TableCell>
                <TableCell>
                  <TriageBadge state={b.triage} />
                </TableCell>
                <TableCell>
                  <StatusPill status={b.status} />
                </TableCell>
                <TableCell className={cn("text-xs capitalize", PAY_TONE[b.payment])}>
                  {b.payment}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No bookings match these filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
