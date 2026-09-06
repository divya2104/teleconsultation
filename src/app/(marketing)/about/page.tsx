import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <Section>
      <Container>
        <PagePlaceholder title="About" note="Mission, clinical governance, Telemedicine Guidelines 2020 stance, DPDP summary." />
      </Container>
    </Section>
  );
}
