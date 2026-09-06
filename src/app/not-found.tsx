import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 text-2xl">We couldn&apos;t find that page</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The link may be broken or the page may have moved.
        </p>
      </div>
      <Button asChild className="bg-cta text-cta-foreground hover:bg-cta-hover">
        <Link href="/">Back to home</Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        Not for medical emergencies — call your local emergency number.
      </p>
    </div>
  );
}
