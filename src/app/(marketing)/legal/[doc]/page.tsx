import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PagePlaceholder } from "@/components/common/page-placeholder";

const TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  "telemedicine-consent": "Telemedicine Consent",
  "refund-policy": "Refund Policy",
};

export default async function Page({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const title = TITLES[doc] ?? "Legal";
  return (
    <Section>
      <Container size="prose">
        <PagePlaceholder title={title} note="Long-form legal document. Prose layout + TOC in Step 4." />
      </Container>
    </Section>
  );
}
