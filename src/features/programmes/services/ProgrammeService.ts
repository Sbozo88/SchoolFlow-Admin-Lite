import { AuditService } from "@/services/AuditService";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { ProgrammeGroupRepository, ProgrammeRepository } from "../repositories/ProgrammeRepository";
import type { Programme, ProgrammeFormValues, ProgrammeGroup, ProgrammeGroupFormValues } from "../types";

export class ProgrammeService {
  private programmeRepository: ProgrammeRepository;
  private groupRepository: ProgrammeGroupRepository;

  constructor(private tenantId: string, private userId: string) {
    this.programmeRepository = new ProgrammeRepository(tenantId);
    this.groupRepository = new ProgrammeGroupRepository(tenantId);
  }

  getProgrammes(): Promise<Programme[]> {
    return this.programmeRepository.query({
      orderByField: "name",
      orderDirection: "asc",
      limitCount: DEFAULT_COLLECTION_LIMIT,
    });
  }

  getGroups(): Promise<ProgrammeGroup[]> {
    return this.groupRepository.query({
      orderByField: "name",
      orderDirection: "asc",
      limitCount: DEFAULT_COLLECTION_LIMIT,
    });
  }

  async createProgramme(data: ProgrammeFormValues): Promise<string> {
    const payload = { ...data, createdBy: this.userId, updatedBy: this.userId };
    const id = await this.programmeRepository.create(payload);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "programme", id, null, payload);
    return id;
  }

  async updateProgramme(id: string, data: Partial<ProgrammeFormValues>): Promise<void> {
    const before = await this.programmeRepository.getById(id);
    const payload = { ...data, updatedBy: this.userId };
    await this.programmeRepository.update(id, payload);
    await AuditService.log(this.tenantId, this.userId, "UPDATE", "programme", id, before, payload);
  }

  async deleteProgramme(id: string): Promise<void> {
    const before = await this.programmeRepository.getById(id);
    await this.programmeRepository.softDelete(id, this.userId);
    await AuditService.log(this.tenantId, this.userId, "DELETE", "programme", id, before, null);
  }

  async createGroup(data: ProgrammeGroupFormValues): Promise<string> {
    const payload = { ...data, createdBy: this.userId, updatedBy: this.userId };
    const id = await this.groupRepository.create(payload);
    await AuditService.log(this.tenantId, this.userId, "CREATE", "programmeGroup", id, null, payload);
    return id;
  }
}
