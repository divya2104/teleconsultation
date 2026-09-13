import { FocusShell } from "@/components/layout/focus-shell";
import { RemotePad } from "@/components/intake/remote-pad";

export const metadata = { title: "Eye test remote" };

/** Public: the phone joins a running eye test on another screen with a 6-digit code. */
export default function Page() {
  return (
    <FocusShell containerSize="prose">
      <RemotePad />
    </FocusShell>
  );
}
