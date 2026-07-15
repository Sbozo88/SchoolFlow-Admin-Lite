/** Modular billing plans — payment gateways plug in later. */

export type PlanDefinition = {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  learnerLimit: number;
  storageQuotaBytes: number;
  features: string[];
};

export const DEFAULT_PLAN_ID = "plan-starter";

export const SUBSCRIPTION_PLANS: PlanDefinition[] = [
  {
    id: "plan-starter",
    name: "Starter",
    priceMonthly: 0,
    currency: "ZAR",
    learnerLimit: 50,
    storageQuotaBytes: 1 * 1024 * 1024 * 1024,
    features: ["learners", "attendance", "payments"],
  },
  {
    id: "plan-growth",
    name: "Growth",
    priceMonthly: 499,
    currency: "ZAR",
    learnerLimit: 250,
    storageQuotaBytes: 5 * 1024 * 1024 * 1024,
    features: ["learners", "attendance", "payments", "reports", "followups"],
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    priceMonthly: 1499,
    currency: "ZAR",
    learnerLimit: 5000,
    storageQuotaBytes: 50 * 1024 * 1024 * 1024,
    features: ["all", "priority_support", "impersonation"],
  },
];

export function getPlanById(planId: string): PlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

export type BillingInvoiceStatus = "draft" | "open" | "paid" | "void" | "past_due";

export type BillingInvoice = {
  id: string;
  tenantId: string;
  planId: string;
  amount: number;
  currency: string;
  status: BillingInvoiceStatus;
  periodStart: string;
  periodEnd: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
};

export function buildInvoiceDraft(input: {
  tenantId: string;
  planId: string;
  actorUserId: string;
  periodStart: string;
  periodEnd: string;
  now: () => unknown;
}): Omit<BillingInvoice, "id"> {
  const plan = getPlanById(input.planId);
  if (!plan) throw new Error(`Unknown plan: ${input.planId}`);
  const now = input.now();
  return {
    tenantId: input.tenantId,
    planId: plan.id,
    amount: plan.priceMonthly,
    currency: plan.currency,
    status: "open",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    createdBy: input.actorUserId,
    createdAt: now,
    updatedAt: now,
  };
}

/** Gateway adapter seam — no live provider required. */
export type PaymentGatewayAdapter = {
  id: string;
  charge: (invoice: BillingInvoice) => Promise<{ ok: boolean; reference?: string }>;
};

export const noopPaymentGateway: PaymentGatewayAdapter = {
  id: "noop",
  async charge() {
    return { ok: false, reference: "gateway-not-configured" };
  },
};
