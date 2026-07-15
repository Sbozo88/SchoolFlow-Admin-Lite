import { TenantRepository } from "@/repositories/TenantRepository";
import { Learner } from "../types";

export class LearnerRepository extends TenantRepository<Learner> {
  constructor(tenantId: string) {
    super("learners", tenantId);
  }
}
