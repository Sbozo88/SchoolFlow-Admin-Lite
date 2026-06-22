export type SupportPlanType = "none" | "starter" | "standard" | "premium";

export type ProgrammeSettings = {
  id: string;
  organisationName: string;
  programmeName: string;
  defaultMonthlyFee?: number;
  classes: string[];
  programmes: string[];
  instrumentsOrActivities: string[];
  whatsappTemplates: Record<string, string>;
  supportPlan?: SupportPlanType;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationSettings = {
  id: string;
  organizationName: string;
  currency: string;
  timezone?: string;
  programmes: string[];
  defaultMonthlyFee: number;
  enrollmentFormEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
