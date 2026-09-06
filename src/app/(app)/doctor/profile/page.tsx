import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Doctor profile" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Doctor profile" description="Registration number, specialty, verification status, bio, payout details." />
      <PagePlaceholder title="Doctor profile form" />
    </div>
  );
}
