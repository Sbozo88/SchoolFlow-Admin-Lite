import type { PaymentStatus } from "./payment";

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
  learnerStatus: "active" | "inactive" | "pending" | "archived";
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
  learnerStatus: "active" | "inactive" | "pending" | "archived";
  notes: string;
};
