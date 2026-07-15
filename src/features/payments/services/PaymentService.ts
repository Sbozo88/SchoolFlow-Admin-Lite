import { PaymentRepository } from "../repositories/PaymentRepository";
import { PaymentRecord, PaymentFormValues } from "../types";
import { AuditService } from "@/services/AuditService";

export class PaymentService {
  private repository: PaymentRepository;
  private tenantId: string;
  private userId: string;

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.repository = new PaymentRepository(tenantId);
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    return this.repository.query();
  }

  async createPayment(data: PaymentFormValues): Promise<string> {
    const enrichedData = {
      ...data,
      createdBy: this.userId,
      updatedBy: this.userId,
    };
    const id = await this.repository.create(enrichedData);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "payment", id, null, enrichedData);
    return id;
  }

  async updatePayment(id: string, data: Partial<PaymentFormValues>): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    const enrichedData = {
      ...data,
      updatedBy: this.userId,
    };
    await this.repository.update(id, enrichedData);
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "payment", id, oldRecord, enrichedData);
  }

  async deletePayment(id: string): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    await this.repository.delete(id);
    await AuditService.log(this.tenantId, this.userId, "DELETE", "payment", id, oldRecord, null);
  }
}
