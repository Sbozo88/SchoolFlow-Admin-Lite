import { AttendanceRepository } from "../repositories/AttendanceRepository";
import { AttendanceRecord, AttendanceFormValues } from "../types";
import { AuditService } from "@/services/AuditService";

export class AttendanceService {
  private repository: AttendanceRepository;
  private tenantId: string;
  private userId: string;

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.repository = new AttendanceRepository(tenantId);
  }

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    return this.repository.query();
  }

  async createAttendance(data: AttendanceFormValues): Promise<string> {
    const enrichedData = {
      ...data,
      createdBy: this.userId,
      updatedBy: this.userId,
    };
    const id = await this.repository.create(enrichedData);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "attendance", id, null, enrichedData);
    return id;
  }

  async updateAttendance(id: string, data: Partial<AttendanceFormValues>): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    const enrichedData = {
      ...data,
      updatedBy: this.userId,
    };
    await this.repository.update(id, enrichedData);
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "attendance", id, oldRecord, enrichedData);
  }

  async deleteAttendance(id: string): Promise<void> {
    const oldRecord = await this.repository.getById(id);
    await this.repository.delete(id);
    await AuditService.log(this.tenantId, this.userId, "DELETE", "attendance", id, oldRecord, null);
  }
}
