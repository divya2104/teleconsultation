"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Stethoscope, User } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Phase = "identifier" | "otp" | "profile" | "role" | "apply" | "applied";

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const practice = params.get("intent") === "practice";

  const [phase, setPhase] = useState<Phase>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = () => {
    setResendIn(30);
    setPhase("otp");
  };

  const verify = () => {
    if (otp.replace(/\D/g, "").length < 4) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setPhase(practice ? "apply" : "role");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <Logo />

      {phase === "identifier" && (
        <div className="mt-8">
          <h1 className="text-2xl">
            {practice ? "Apply to practise" : "Log in or sign up"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll send a one-time code. No password to remember.
          </p>
          <div className="mt-6 flex flex-col gap-1.5">
            <Label htmlFor="id">Mobile number or email</Label>
            <Input
              id="id"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="off"
            />
          </div>
          <Button
            className="mt-5 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={identifier.trim().length < 4}
            onClick={sendCode}
          >
            Send code
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/legal/terms" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      )}

      {phase === "otp" && (
        <div className="mt-8">
          <button
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading"
            onClick={() => setPhase("identifier")}
          >
            <ArrowLeft className="size-4" />
            Change {identifier.includes("@") ? "email" : "number"}
          </button>
          <h1 className="text-2xl">Enter the code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sent to <span className="text-foreground">{identifier}</span>
          </p>
          <Input
            className="mt-6 text-center font-mono text-lg tracking-[0.4em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="••••••"
          />
          <Button
            className="mt-5 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            onClick={verify}
          >
            Verify
          </Button>
          <button
            className="mt-4 text-xs text-muted-foreground enabled:hover:text-heading disabled:opacity-60"
            disabled={resendIn > 0}
            onClick={() => setResendIn(30)}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      )}

      {phase === "role" && (
        <div className="mt-8">
          <h1 className="text-2xl">Continue as</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo — pick a view to explore. Real accounts route automatically.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {[
              { label: "Patient", href: "/dashboard", icon: User },
              { label: "Doctor", href: "/doctor/dashboard", icon: Stethoscope },
              { label: "Admin", href: "/admin", icon: Check },
            ].map(({ label, href, icon: Icon }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="flex items-center justify-between rounded-[--radius-md] border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-heading hover:border-primary hover:bg-primary-subtle"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "apply" && (
        <div className="mt-8">
          <h1 className="text-2xl">Practitioner details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We verify your registration before you can take consultations.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Dr. …" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg">Medical registration number</Label>
              <Input id="reg" placeholder="e.g. KMC/12345" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="spec">Specialty</Label>
              <Select>
                <SelectTrigger id="spec">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General ophthalmology</SelectItem>
                  <SelectItem value="cornea">Cornea & refractive</SelectItem>
                  <SelectItem value="glaucoma">Glaucoma</SelectItem>
                  <SelectItem value="retina">Retina</SelectItem>
                  <SelectItem value="paediatric">Paediatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cred">Credential documents</Label>
              <Input id="cred" type="file" multiple />
              <span className="text-xs text-muted-foreground">
                Registration certificate and a government photo ID.
              </span>
            </div>
          </div>
          <Button
            className="mt-5 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            onClick={() => setPhase("applied")}
          >
            Submit application
          </Button>
        </div>
      )}

      {phase === "applied" && (
        <div className="mt-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-subtle text-primary">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-2xl">Application received</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            We&apos;ll verify your registration against the state medical council
            record and email you, usually within a few working days.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
