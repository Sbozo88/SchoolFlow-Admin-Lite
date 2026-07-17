import { type QueryConstraint, where, type WithFieldValue, type UpdateData } from "firebase/firestore";
import { BaseRepository, type QueryOptions } from "./BaseRepository";
import { BaseDocument } from "@/types/base";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { notDeleted } from "@/lib/data/notDeleted";

export abstract class TenantRepository<T extends BaseDocument> extends BaseRepository<T> {
  protected tenantId: string;

  constructor(collectionName: string, tenantId: string) {
    super(collectionName);
    this.tenantId = tenantId;
  }

  override async getById(id: string): Promise<T | null> {
    const record = await super.getById(id);
    if (record && record.tenantId === this.tenantId) {
      return record;
    }
    return null;
  }

  override async query(constraintsOrOptions: QueryConstraint[] | QueryOptions = []): Promise<T[]> {
    const options: QueryOptions = Array.isArray(constraintsOrOptions)
      ? { constraints: constraintsOrOptions }
      : constraintsOrOptions;

    const tenantConstraint = where("tenantId", "==", this.tenantId);
    const rows = await super.query({
      ...options,
      constraints: [tenantConstraint, ...(options.constraints ?? [])],
      limitCount: options.limitCount ?? DEFAULT_COLLECTION_LIMIT,
    });
    return notDeleted(rows);
  }

  override async create(data: Partial<Omit<T, "id" | "tenantId">> | WithFieldValue<Omit<T, "id">>): Promise<string> {
    const now = new Date().toISOString();
    const safeData = data as Record<string, unknown>;
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
    // Soft-delete by default for tenant-scoped operational data
    return this.softDelete(id, "system");
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error(`Record ${id} not found or does not belong to tenant ${this.tenantId}`);
    }
    return this.update(id, {
      status: "deleted",
      updatedBy: userId,
    } as unknown as UpdateData<T>);
  }

  /** Irreversible remove — platform purge only. */
  async hardDelete(id: string): Promise<void> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error(`Record ${id} not found or does not belong to tenant ${this.tenantId}`);
    }
    return super.delete(id);
  }
}
