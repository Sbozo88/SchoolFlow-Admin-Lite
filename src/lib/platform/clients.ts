import type { TenantStatus, SubscriptionStatus } from "@/lib/tenant/types";

export type ClientLifecycleAction = "suspend" | "reactivate" | "archive" | "delete";

export function nextStatusForLifecycle(
  current: TenantStatus,
  action: ClientLifecycleAction,
): TenantStatus | "deleted" {
  switch (action) {
    case "suspend":
      if (current === "archived") throw new Error("Cannot suspend an archived client");
      return "suspended";
    case "reactivate":
      if (current === "archived") throw new Error("Cannot reactivate an archived client; create a new tenant");
      return "active";
    case "archive":
      return "archived";
    case "delete":
      return "deleted";
    default:
      throw new Error(`Unknown lifecycle action: ${action}`);
  }
}

export function clientIsOperable(status: TenantStatus): boolean {
  return status === "active" || status === "trial";
}

export type PlatformStatsInput = {
  tenants: Array<{ status: TenantStatus; subscriptionStatus?: SubscriptionStatus; storageUsedBytes?: number }>;
};

export function computePlatformStats(input: PlatformStatsInput) {
  const tenants = input.tenants;
  const totalClients = tenants.length;
  const activeClients = tenants.filter((t) => t.status === "active" || t.status === "trial").length;
  const suspendedClients = tenants.filter((t) => t.status === "suspended").length;
  const archivedClients = tenants.filter((t) => t.status === "archived").length;
  const storageUsage = tenants.reduce((sum, t) => sum + (t.storageUsedBytes ?? 0), 0);
  const trialClients = tenants.filter((t) => t.subscriptionStatus === "trial" || t.status === "trial").length;
  const activeSubscriptions = tenants.filter((t) => t.subscriptionStatus === "active").length;

  return {
    totalClients,
    activeClients,
    suspendedClients,
    archivedClients,
    trialClients,
    activeSubscriptions,
    storageUsage,
    systemHealth: "ok" as const,
  };
}
