import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Profile & consent" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile & consent" description="Contact details, diabetes status, notification preferences, and data controls." />
      <PagePlaceholder title="Profile form" note="Includes DPDP 'delete my data'. Built in Step 5." />
    </div>
  );
}
