import { TenantRepository } from "@/repositories/TenantRepository";
import { PaymentRecord } from "../types";

export class PaymentRepository extends TenantRepository<PaymentRecord> {
  constructor(tenantId: string) {
    super("payments", tenantId);
  }
}
