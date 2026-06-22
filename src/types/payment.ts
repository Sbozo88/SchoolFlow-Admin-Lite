import type { Timestamp } from "firebase/firestore";

export type PaymentStatus = "draft" | "sent" | "paid" | "overdue";

export type Payment = {
  id: string;
  learnerId: string;
  learnerName: string;
  parentName: string;
  amount: number;
  dueDate: Timestamp | Date;
  status: PaymentStatus;
  paidAt?: Timestamp | Date;
};
