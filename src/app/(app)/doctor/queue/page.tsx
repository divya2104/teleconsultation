import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Consult queue" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Consult queue" description="Upcoming, past-due and completed consults with filters." />
      <PagePlaceholder title="Filterable queue table" />
    </div>
  );
}
