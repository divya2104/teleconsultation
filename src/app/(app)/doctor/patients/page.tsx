import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Patients" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Patients" description="Patients you have consulted, with history and risk flags." />
      <PagePlaceholder title="Patient list" />
    </div>
  );
}
