import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Doctor dashboard" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Today's queue" description="Consults ordered by slot, each with a triage summary." />
      <PagePlaceholder title="Consult queue + triage rows" />
    </div>
  );
}
