import { PageHeader } from "@/components/layout/page-header";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Patient ${id}`} description="Past appointments, prescriptions, triage records, diabetes / risk flags." />
      <PagePlaceholder title="Patient history" />
    </div>
  );
}
