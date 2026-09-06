import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Pricing" };

export default function Page() {
  return (
    <Section>
      <Container>
        <PagePlaceholder title="Pricing" note="Pay-per-consultation only. One price card, what's included, refund policy." />
      </Container>
    </Section>
  );
}
