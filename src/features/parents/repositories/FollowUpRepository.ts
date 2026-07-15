import { TenantRepository } from "@/repositories/TenantRepository";
import { FollowUpRecord } from "../types";

export class FollowUpRepository extends TenantRepository<FollowUpRecord> {
  constructor(tenantId: string) {
    super("parentFollowUps", tenantId); // Matching the original collection name
  }
}
