import { TenantRepository } from "@/repositories/TenantRepository";
import type { Programme, ProgrammeGroup } from "../types";

export class ProgrammeRepository extends TenantRepository<Programme> {
  constructor(tenantId: string) {
    super("programmes", tenantId);
  }
}

export class ProgrammeGroupRepository extends TenantRepository<ProgrammeGroup> {
  constructor(tenantId: string) {
    super("programmeGroups", tenantId);
  }
}
