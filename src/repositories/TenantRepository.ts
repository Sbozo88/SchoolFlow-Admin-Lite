import { QueryConstraint, where, WithFieldValue, UpdateData } from "firebase/firestore";
import { BaseRepository } from "./BaseRepository";
import { BaseDocument } from "@/types/base";

export abstract class TenantRepository<T extends BaseDocument> extends BaseRepository<T> {
  protected tenantId: string;

  constructor(collectionName: string, tenantId: string) {
    super(collectionName);
    this.tenantId = tenantId;
  }

  override async getById(id: string): Promise<T | null> {
    const record = await super.getById(id);
    // Enforce tenant isolation strictly even on direct lookups
    if (record && record.tenantId === this.tenantId) {
      return record;
    }
    return null;
  }

  override async query(constraints: QueryConstraint[] = []): Promise<T[]> {
    const tenantConstraint = where("tenantId", "==", this.tenantId);
    return super.query([tenantConstraint, ...constraints]);
  }

  override async create(data: Partial<Omit<T, "id" | "tenantId">> | WithFieldValue<Omit<T, "id">>): Promise<string> {
    const now = new Date().toISOString();
    const safeData = data as any;
    const enrichedData = {
      ...safeData,
      tenantId: this.tenantId,
      createdAt: safeData.createdAt || now,
      updatedAt: safeData.updatedAt || now,
      status: safeData.status || "active",
    } as WithFieldValue<Omit<T, "id">>;
    return super.create(enrichedData);
  }

  override async update(id: string, data: UpdateData<T>): Promise<void> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error(`Record ${id} not found or does not belong to tenant ${this.tenantId}`);
    }
    const enrichedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return super.update(id, enrichedData);
  }

  override async delete(id: string): Promise<void> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error(`Record ${id} not found or does not belong to tenant ${this.tenantId}`);
    }
    return super.delete(id);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    return this.update(id, {
      status: "deleted",
      updatedBy: userId,
    } as unknown as UpdateData<T>);
  }
}
