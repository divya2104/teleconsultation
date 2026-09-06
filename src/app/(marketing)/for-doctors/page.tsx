import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "For doctors" };

export default function Page() {
  return (
    <Section>
      <Container>
        <PagePlaceholder title="For doctors" note="Recruitment landing — value prop, onboarding, verification, earnings, FAQ." />
      </Container>
    </Section>
  );
}
