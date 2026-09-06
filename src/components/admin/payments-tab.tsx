"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactions as seed, type Transaction } from "@/lib/mock/admin";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  captured: "text-triage-normal-fg",
  refunded: "text-muted-foreground",
  failed: "text-destructive",
};

export function PaymentsTab() {
  const [txns, setTxns] = useState<Transaction[]>(seed);
  const [reason, setReason] = useState("no-show");

  const refund = (t: Transaction) => {
    setTxns((list) =>
      list.map((x) => (x.id === t.id ? { ...x, status: "refunded" } : x)),
    );
    toast.success(`Refund initiated for ${t.ref} (${reason})`);
  };

  return (
    <div className="overflow-x-auto rounded-[--radius-lg] border border-border bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking</TableHead>
            <TableHead>Gateway ref</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txns.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.ref}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {t.gatewayRef}
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums">{t.date}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                ₹{t.amount}
              </TableCell>
              <TableCell className={cn("text-xs capitalize", TONE[t.status])}>
                {t.status}
              </TableCell>
              <TableCell className="text-right">
                {t.status === "captured" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Refund
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Refund ₹{t.amount} for {t.ref}?</DialogTitle>
                        <DialogDescription>
                          Refunds go back to the original payment method via
                          Razorpay, typically in 5–7 working days. Check the
                          cancellation and no-show policy before refunding.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Reason</label>
                        <Select value={reason} onValueChange={setReason}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-show">Doctor no-show</SelectItem>
                            <SelectItem value="cancelled">Cancelled in window</SelectItem>
                            <SelectItem value="technical">Technical failure</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => refund(t)}
                          >
                            Refund ₹{t.amount}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
