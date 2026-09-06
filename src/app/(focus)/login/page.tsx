import { Suspense } from "react";
import { LoginFlow } from "@/components/auth/login-flow";

export const metadata = { title: "Log in" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginFlow />
    </Suspense>
  );
}
