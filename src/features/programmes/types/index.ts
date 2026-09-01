import { BaseDocument } from "@/types/base";

export type ProgrammeType = "music" | "dance";
export type ProgrammeStatus = "active" | "inactive" | "archived";

export interface Programme extends BaseDocument {
  name: string;
  programmeType: ProgrammeType;
  description?: string;
  programmeStatus: ProgrammeStatus;
}

export interface ProgrammeGroup extends BaseDocument {
  programmeId: string;
  name: string;
  groupType: string;
  level?: string;
  teacherId?: string;
  venue?: string;
  capacity?: number;
  groupStatus: ProgrammeStatus;
}

export type ProgrammeFormValues = Omit<
  Programme,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "status"
>;

export type ProgrammeGroupFormValues = Omit<
  ProgrammeGroup,
  "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "status"
>;
