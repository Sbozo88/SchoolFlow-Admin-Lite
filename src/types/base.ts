export interface BaseDocument {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status?: "active" | "inactive" | "archived" | "deleted" | string;
}
