export type PaymentStatus = "paid" | "unpaid" | "partial" | "overdue";

export type Learner = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  programme: string;
  instrumentOrActivity: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LearnerFormValues = {
  firstName: string;
  lastName: string;
  className: string;
  programme: string;
  instrumentOrActivity: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  paymentStatus: PaymentStatus;
  notes: string;
};
