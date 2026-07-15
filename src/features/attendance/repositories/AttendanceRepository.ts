import { TenantRepository } from "@/repositories/TenantRepository";
import { AttendanceRecord } from "../types";

export class AttendanceRepository extends TenantRepository<AttendanceRecord> {
  constructor(tenantId: string) {
    super("attendance", tenantId);
  }
}
