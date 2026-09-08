/**
 * Payment gateway seam. Phase 1 uses `fakePaymentGateway` and
 * `book_appointment` marks the appointment `paid` directly. A real gateway
 * (Razorpay) swaps the implementation and moves capture to its own step —
 * callers of this interface don't change.
 */
export interface PaymentGateway {
  createOrder(amountInPaise: number, ref: string): Promise<{ orderId: string }>;
  capture(orderId: string): Promise<{ status: "captured" | "failed" }>;
}

export const fakePaymentGateway: PaymentGateway = {
  async createOrder(amountInPaise, ref) {
    return { orderId: `order_fake_${ref}` };
  },
  async capture() {
    await new Promise((r) => setTimeout(r, 400));
    return { status: "captured" };
  },
};

export const paymentGateway: PaymentGateway = fakePaymentGateway;
