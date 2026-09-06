import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Availability" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Availability" description="Weekly slot windows, blocked dates, timezone." />
      <PagePlaceholder title="Weekly availability editor" />
    </div>
  );
}
