/**
 * Focus routes (login, intake, book, consult) each render their own
 * <FocusShell> so the header centre slot and exit affordance can differ
 * per flow. This group layout is just a passthrough.
 */
export default function FocusGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
