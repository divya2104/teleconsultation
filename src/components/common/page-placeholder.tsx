import { Construction } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

/**
 * Temporary stub for routes whose sections/components land in Steps 4-5.
 * Keeps the shell, routing, and nav wiring real while content is pending.
 */
export function PagePlaceholder({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <EmptyState
      icon={Construction}
      title={title}
      hint={note ?? "Layout and navigation are wired. Sections and components come in Steps 4–5."}
    />
  );
}
