import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";
import type { TenantRecord } from "@/lib/tenant/types";

export type TenantHealth = "healthy" | "attention" | "inactive";

export function getTenantHealth(tenant: TenantRecord): TenantHealth {
  if (tenant.status === "archived" || tenant.subscriptionStatus === "cancelled" || tenant.subscriptionStatus === "expired") {
    return "inactive";
  }
  const storageRatio = tenant.storageQuotaBytes > 0 ? tenant.storageUsedBytes / tenant.storageQuotaBytes : 0;
  if (tenant.status === "suspended" || tenant.subscriptionStatus === "past_due" || storageRatio >= 0.9) {
    return "attention";
  }
  return "healthy";
}

export function buildPlatformDashboardMetrics(tenants: TenantRecord[]) {
  const activeTenants = tenants.filter((tenant) => tenant.subscriptionStatus === "active");
  const monthlyRecurringRevenue = activeTenants.reduce((sum, tenant) => {
    const plan = SUBSCRIPTION_PLANS.find((item) => item.id === tenant.planId);
    return sum + (plan?.priceMonthly ?? 0);
  }, 0);
  const storageUsed = tenants.reduce((sum, tenant) => sum + (tenant.storageUsedBytes || 0), 0);
  const storageQuota = tenants.reduce((sum, tenant) => sum + (tenant.storageQuotaBytes || 0), 0);
  const healthyTenants = tenants.filter((tenant) => getTenantHealth(tenant) === "healthy").length;
  const attentionTenants = tenants.filter((tenant) => getTenantHealth(tenant) === "attention").length;
  const portfolioHealth = tenants.length === 0 ? 100 : Math.round((healthyTenants / tenants.length) * 100);

  const plans = SUBSCRIPTION_PLANS.map((plan) => {
    const planTenants = tenants.filter((tenant) => tenant.planId === plan.id);
    const active = planTenants.filter((tenant) => tenant.subscriptionStatus === "active").length;
    return {
      id: plan.id,
      name: plan.name,
      clients: planTenants.length,
      active,
      revenue: active * plan.priceMonthly,
    };
  });

  return {
    monthlyRecurringRevenue,
    storageUsed,
    storageQuota,
    storageUtilization: storageQuota > 0 ? Math.round((storageUsed / storageQuota) * 100) : 0,
    healthyTenants,
    attentionTenants,
    portfolioHealth,
    plans,
  };
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** exponent;
  return `${amount >= 10 || exponent === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[exponent]}`;
}
