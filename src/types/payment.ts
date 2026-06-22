export type PaymentStatus = "paid" | "unpaid" | "partial" | "overdue";

export type PaymentRecord = {
  id: string;
  learnerId: string;
  learnerName: string;
  month: string;
  expectedAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  paymentDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
