"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";

type Phase = "identifier" | "otp" | "apply" | "applied";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone OTP needs a live SMS provider (Twilio/MSG91 + Indian DLT registration).
// Off by default; local dev sets NEXT_PUBLIC_PHONE_OTP_ENABLED=true in .env.local.
const PHONE_OTP_ENABLED = process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === "true";

type Channel =
  | { channel: "email"; email: string }
  | { channel: "phone"; phone: string; display: string }
  | { channel: "invalid" };

// One smart field: an "@" means email; otherwise a bare 10-digit Indian mobile
// (spaces/dashes ignored) becomes +91XXXXXXXXXX.
function classifyIdentifier(raw: string): Channel {
  const v = raw.trim();
  if (v.includes("@")) {
    return EMAIL_RE.test(v) ? { channel: "email", email: v } : { channel: "invalid" };
  }
  const digits = v.replace(/[\s-]/g, "").replace(/^\+?91/, "").replace(/\D/g, "");
  if (digits.length === 10) {
    return {
      channel: "phone",
      phone: `+91${digits}`,
      display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
  }
  return { channel: "invalid" };
}

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const practice = params.get("intent") === "practice";
  const next = params.get("next") || "";
  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  const id = classifyIdentifier(identifier);
  const idDisplay = id.channel === "email" ? id.email : id.channel === "phone" ? id.display : identifier.trim();
  const phoneBlocked = id.channel === "phone" && !PHONE_OTP_ENABLED;
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);

  // practitioner-application fields
  const [applyName, setApplyName] = useState("");
  const [applyReg, setApplyReg] = useState("");
  const [applySpec, setApplySpec] = useState("");

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    if (phoneBlocked) {
      toast.error(
        "Phone sign-in isn't available yet — use your email address for now.",
      );
      return;
    }
    if (id.channel === "invalid") {
      toast.error("Enter a valid email or 10-digit mobile number");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp(
      id.channel === "email"
        ? { email: id.email, options: { shouldCreateUser: true } }
        : { phone: id.phone, options: { shouldCreateUser: true } },
    );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResendIn(30);
    setPhase("otp");
  };

  const verify = async () => {
    const token = otp.replace(/\D/g, "");
    if (token.length < 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    if (id.channel === "invalid") return;
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp(
      id.channel === "email"
        ? { email: id.email, token, type: "email" }
        : { phone: id.phone, token, type: "sms" },
    );
    if (error || !data.user) {
      setBusy(false);
      toast.error(error?.message ?? "That code didn't work");
      return;
    }

    if (practice) {
      setBusy(false);
      setPhase("apply");
      return;
    }

    if (next.startsWith("/")) {
      router.replace(next);
      router.refresh();
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    router.replace(
      profile?.role === "doctor"
        ? "/doctor/dashboard"
        : profile?.role === "admin"
          ? "/admin"
          : "/dashboard",
    );
    router.refresh();
  };

  const submitApplication = async () => {
    if (!applyName.trim() || !applyReg.trim() || !applySpec) {
      toast.error("Fill in name, registration number and specialty");
      return;
    }
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setBusy(false);
      toast.error("Session expired — request a new code");
      setPhase("identifier");
      return;
    }
    const { error } = await supabase.from("doctors").insert({
      profile_id: auth.user.id,
      name: applyName.trim(),
      reg_no: applyReg.trim(),
      specialty: applySpec,
      verification_status: "pending",
      active: false,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPhase("applied");
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
            {PHONE_OTP_ENABLED
              ? "We'll send a one-time code by email or SMS. No password to remember."
              : "We'll email you a one-time code. No password to remember."}
          </p>
          <div className="mt-6 flex flex-col gap-1.5">
            <Label htmlFor="id">
              {PHONE_OTP_ENABLED ? "Email or mobile number" : "Email address"}
            </Label>
            <Input
              id="id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                PHONE_OTP_ENABLED
                  ? "you@example.com or 98765 43210"
                  : "you@example.com"
              }
              autoComplete="username"
            />
            {phoneBlocked ? (
              <p className="text-xs text-muted-foreground-strong">
                Phone sign-in isn&apos;t available yet — use your email address.
              </p>
            ) : null}
          </div>
          <Button
            className="mt-5 h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={busy || id.channel === "invalid" || phoneBlocked}
            onClick={sendCode}
          >
            {busy ? "Sending…" : "Send code"}
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
            Change
          </button>
          <h1 className="text-2xl">Enter the code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sent to <span className="text-foreground">{idDisplay}</span>
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
            disabled={busy}
            onClick={verify}
          >
            {busy ? "Verifying…" : "Verify"}
          </Button>
          <button
            className="mt-4 text-xs text-muted-foreground enabled:hover:text-heading disabled:opacity-60"
            disabled={resendIn > 0 || busy}
            onClick={sendCode}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
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
              <Input
                id="name"
                placeholder="Dr. …"
                value={applyName}
                onChange={(e) => setApplyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg">Medical registration number</Label>
              <Input
                id="reg"
                placeholder="e.g. KMC/12345"
                value={applyReg}
                onChange={(e) => setApplyReg(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="spec">Specialty</Label>
              <Select value={applySpec} onValueChange={setApplySpec}>
                <SelectTrigger id="spec">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General ophthalmology">
                    General ophthalmology
                  </SelectItem>
                  <SelectItem value="Cornea & refractive">
                    Cornea &amp; refractive
                  </SelectItem>
                  <SelectItem value="Glaucoma & general">
                    Glaucoma &amp; general
                  </SelectItem>
                  <SelectItem value="Retina & vitreous">
                    Retina &amp; vitreous
                  </SelectItem>
                  <SelectItem value="Paediatric ophthalmology">
                    Paediatric ophthalmology
                  </SelectItem>
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
            disabled={busy}
            onClick={submitApplication}
          >
            {busy ? "Submitting…" : "Submit application"}
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
