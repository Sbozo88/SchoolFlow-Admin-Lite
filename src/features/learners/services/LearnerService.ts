import { LearnerRepository } from "../repositories/LearnerRepository";
import { Learner, LearnerFormValues } from "../types";
import { AuditService } from "@/services/AuditService";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";

export class LearnerService {
  private repository: LearnerRepository;
  private tenantId: string;
  private userId: string;

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.repository = new LearnerRepository(tenantId);
  }

  async getAllLearners(): Promise<Learner[]> {
    return this.repository.query({
      orderByField: "lastName",
      orderDirection: "asc",
      limitCount: DEFAULT_COLLECTION_LIMIT,
    });
  }

  async createLearner(data: LearnerFormValues): Promise<string> {
    const enrichedData = {
      ...data,
      createdBy: this.userId,
      updatedBy: this.userId,
    };
    const id = await this.repository.create(enrichedData);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "learner", id, null, enrichedData);
    return id;
  }

  async updateLearner(id: string, data: Partial<LearnerFormValues>): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    const enrichedData = {
      ...data,
      updatedBy: this.userId,
    };
    await this.repository.update(id, enrichedData);
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "learner", id, oldRecord, enrichedData);
  }

  async deleteLearner(id: string): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    await this.repository.softDelete(id, this.userId);
    await AuditService.log(this.tenantId, this.userId, "DELETE", "learner", id, oldRecord, null);
  }
}
