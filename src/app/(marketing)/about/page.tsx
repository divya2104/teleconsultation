import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <>
      <Section className="border-b border-border-brand bg-[linear-gradient(180deg,#eef9fb_0%,var(--background)_100%)]">
        <Container>
          <SectionHeading
            eyebrow="About ClearSight"
            title="Eye care that reaches people before their sight does"
            lead="Access to an ophthalmologist in India often means travel, waiting rooms, and delay. We start with a screening-first video consultation that needs no special hardware — so the barrier to a first opinion is a phone and five minutes."
          />
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Our approach" title="Screening first, capital-light" />
            <p className="mt-4 text-sm text-muted-foreground-strong">
              Rather than sending hardware to homes, we guide patients through a
              self-test on their own device: a calibrated vision check, a symptom
              questionnaire, and a few eye photos. The doctor opens the
              consultation with a ready-made triage summary. It ships fast, scales
              without logistics, and puts a specialist opinion within reach.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <SectionHeading eyebrow="Clinical governance" title="The doctor decides, always" />
            <p className="mt-4 text-sm text-muted-foreground-strong">
              AI on ClearSight is assistive only. It scores urgency and screens
              photos for gross red flags to help the doctor prepare — it never
              produces a diagnosis, and patients are never shown its output as a
              finding. Every clinical decision is made by a registered
              ophthalmologist.
            </p>
          </Reveal>
          <Reveal>
            <SectionHeading eyebrow="Regulation & privacy" title="Built to the 2020 guidelines" />
            <p className="mt-4 text-sm text-muted-foreground-strong">
              We follow India&apos;s Telemedicine Practice Guidelines (2020):
              registered doctors only, proper consultation documentation, and
              clear limits on what technology may do. Health data is encrypted in
              transit and at rest. In line with the DPDP Act, we collect photo and
              health data only with explicit consent, minimize what we store, and
              let you delete your account data on request.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <SectionHeading eyebrow="Contact" title="Reach us" />
            <p className="mt-4 text-sm text-muted-foreground-strong">
              Support: <a href="mailto:support@clearsight.example" className="text-primary hover:underline">support@clearsight.example</a>
              <br />
              Grievance officer: <a href="mailto:grievance@clearsight.example" className="text-primary hover:underline">grievance@clearsight.example</a>
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
