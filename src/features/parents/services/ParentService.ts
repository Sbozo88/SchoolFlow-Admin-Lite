import { ParentSubmissionRepository } from "../repositories/ParentSubmissionRepository";
import { FollowUpRepository } from "../repositories/FollowUpRepository";
import { ParentSubmissionRecord, ParentSubmissionFormValues, FollowUpRecord, FollowUpFormValues } from "../types";
import { AuditService } from "@/services/AuditService";

export class ParentService {
  private submissionRepo: ParentSubmissionRepository;
  private followUpRepo: FollowUpRepository;
  private tenantId: string;
  private userId?: string;

  // userId can be optional for public parent form submissions
  constructor(tenantId: string, userId?: string) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.submissionRepo = new ParentSubmissionRepository(tenantId);
    this.followUpRepo = new FollowUpRepository(tenantId);
  }

  async getAllSubmissions(): Promise<ParentSubmissionRecord[]> {
    return this.submissionRepo.query();
  }

  async submitParentForm(data: ParentSubmissionFormValues): Promise<string> {
    const enrichedData = {
      ...data,
      status: "new" as const,
      createdBy: this.userId || "system",
      updatedBy: this.userId || "system",
    };
    const id = await this.submissionRepo.create(enrichedData);
    if (this.userId) {
      await AuditService.log(this.tenantId, this.userId, "CREATE", "parentSubmission", id, null, enrichedData);
    }
    return id;
  }

  async updateSubmissionStatus(id: string, status: "new" | "reviewed" | "converted" | "archived"): Promise<void> {
    if (!this.userId) throw new Error("Unauthorized");
    const oldRecord = await this.submissionRepo.getById(id);
    await this.submissionRepo.update(id, { status, updatedBy: this.userId });
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "parentSubmission", id, oldRecord, { status });
  }

  async getAllFollowUps(): Promise<FollowUpRecord[]> {
    return this.followUpRepo.query();
  }

  async createFollowUp(data: FollowUpFormValues): Promise<string> {
    if (!this.userId) throw new Error("Unauthorized");
    const enrichedData = {
      ...data,
      createdBy: this.userId,
      updatedBy: this.userId,
    };
    const id = await this.followUpRepo.create(enrichedData);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "followUp", id, null, enrichedData);
    return id;
  }

  async updateFollowUpStatus(id: string, status: "pending" | "done" | "urgent"): Promise<void> {
    if (!this.userId) throw new Error("Unauthorized");
    const oldRecord = await this.followUpRepo.getById(id);
    await this.followUpRepo.update(id, { status, updatedBy: this.userId });
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "followUp", id, oldRecord, { status });
  }

  async deleteFollowUp(id: string): Promise<void> {
    if (!this.userId) throw new Error("Unauthorized");
    const oldRecord = await this.followUpRepo.getById(id);
    await this.followUpRepo.delete(id);
    await AuditService.log(this.tenantId, this.userId, "DELETE", "followUp", id, oldRecord, null);
  }
}
