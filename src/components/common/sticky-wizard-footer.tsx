/**
 * Persistent action bar for the wizard flows (Book a consult, guided self-test).
 * Fixed to the bottom of the viewport — it never scrolls with the step content.
 *
 * Rendered as the last child of a page's <Container>. The in-flow spacer
 * reserves scroll space equal to the bar's height so the last field is never
 * hidden behind it. (A `position: sticky` last child has no travel room and
 * scrolls away with the content, so it has to be `fixed` + a spacer.)
 */
export function StickyWizardFooter({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="h-24" />
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-2.5 py-4 sm:px-4 md:px-6 lg:px-8"
        style={{ boxShadow: "0 -8px 20px -10px rgba(15, 23, 42, 0.18)" }}
      >
        <div className="mx-auto flex max-w-[var(--container-wide)] items-center justify-between gap-3">
          {children}
        </div>
      </div>
    </>
  );
}
