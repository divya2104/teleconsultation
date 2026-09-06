import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { LEGAL_DOCS } from "@/lib/mock/legal";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  return { title: LEGAL_DOCS[doc]?.title ?? "Legal" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const data = LEGAL_DOCS[doc];
  if (!data) notFound();

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
                On this page
              </p>
              <ul className="mt-3 space-y-2">
                {data.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-muted-foreground-strong hover:text-heading"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="max-w-[65ch]">
            <h1 className="text-4xl">{data.title}</h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Last updated{" "}
              {new Date(data.updated).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · placeholder copy, not legal advice
            </p>

            <div className="mt-10 space-y-10">
              {data.sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-xl">{s.heading}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground-strong">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </Section>
  );
}
