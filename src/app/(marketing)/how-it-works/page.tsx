import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "How it works" };

export default function Page() {
  return (
    <Section>
      <Container>
        <PagePlaceholder title="How it works" note="Patient journey walkthrough — intake, triage summary, video consult, e-prescription, recall. Sections in Step 4." />
      </Container>
    </Section>
  );
}
