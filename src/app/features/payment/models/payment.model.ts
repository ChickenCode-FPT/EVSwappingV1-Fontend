export interface Payment {
  paymentId: number;
  userId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  description?: string | null;
  success: boolean;
  createdAt: string;    // ISO String
  paidAt?: string | null;
  swapTransactionId?: number | null;
  reservationId?: number | null;
  subscriptionId?: number | null;
  gatewayOrderCode?: string | null;
  checkoutUrl?: string | null;
}
