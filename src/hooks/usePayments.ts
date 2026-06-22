import type { Payment } from "@/types/payment";
import { demoPayments } from "@/utils/seedData";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";

export function usePayments() {
  return useFirestoreCollection<Payment>("payments", demoPayments, {
    orderByField: "dueDate",
    orderDirection: "desc",
  });
}
