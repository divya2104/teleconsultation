import { Suspense } from "react";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata = { title: "Admin console" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminConsole />
    </Suspense>
  );
}
