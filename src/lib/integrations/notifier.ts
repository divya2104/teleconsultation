/**
 * Notification seam. Phase 1 logs to the server console; Phase 2 swaps in a
 * WhatsApp Business sender with SMS/email fallback. Fire-and-forget from the
 * Server Actions.
 */
export type NotifyTemplate =
  | "booking_confirmed"
  | "triage_submitted"
  | "recall_due";

export interface Notifier {
  send(
    to: string,
    template: NotifyTemplate,
    vars: Record<string, string>,
  ): Promise<void>;
}

export const consoleNotifier: Notifier = {
  async send(to, template, vars) {
    console.info(`[notify] would send ${template} to ${to}`, vars);
  },
};

export const notifier: Notifier = consoleNotifier;
