import { TenantRepository } from "@/repositories/TenantRepository";
import { ParentSubmissionRecord } from "../types";

export class ParentSubmissionRepository extends TenantRepository<ParentSubmissionRecord> {
  constructor(tenantId: string) {
    super("parentSubmissions", tenantId);
  }
}
