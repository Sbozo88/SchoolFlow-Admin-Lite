import { BaseRepository } from "../repositories/BaseRepository";
import { BaseDocument } from "@/types/base";

export interface AuditLog extends BaseDocument {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "IMPORT" | "EXPORT";
  entity: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ip?: string;
  browser?: string;
}

class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super("auditLogs");
  }
}

export class AuditService {
  private static repository = new AuditLogRepository();

  static async log(
    tenantId: string,
    userId: string,
    action: AuditLog["action"],
    entity: string,
    entityId: string,
    oldValue: any = null,
    newValue: any = null
  ) {
    const now = new Date().toISOString();
    const logEntry: Omit<AuditLog, "id"> = {
      tenantId,
      userId,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    try {
      await this.repository.create(logEntry);
    } catch (error) {
      console.error("Failed to write audit log:", error);
      // We generally do not want audit log failures to crash the main transaction,
      // but in strict environments we might. For now, we log and proceed.
    }
  }
}
