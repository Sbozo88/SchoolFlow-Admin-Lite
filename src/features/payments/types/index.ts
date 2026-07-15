import { BaseDocument } from "@/types/base";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface PaymentRecord extends BaseDocument {
  learnerId: string;
  learnerName: string;
  month: string;
  expectedAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  paymentDate?: string;
  method?: "cash" | "bank_transfer" | "card" | "mobile_money";
  reference?: string;
  notes?: string;
}

export type PaymentFormValues = Omit<
  PaymentRecord,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;
