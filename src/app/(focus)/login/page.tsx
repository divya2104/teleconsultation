import { FocusShell } from "@/components/layout/focus-shell";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Log in" };

export default function Page() {
  return (
    <FocusShell exitHref="/" exitLabel="Back to site">
      <PagePlaceholder title="Phone / email OTP" note="One flow, no passwords. Doctor-apply branch when intent=practice. Step 5." />
    </FocusShell>
  );
}
