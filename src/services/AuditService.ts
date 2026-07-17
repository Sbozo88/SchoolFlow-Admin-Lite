import { writeAuditLog } from "@/firebase/audit";
import type { AuditAction } from "@/lib/audit/auditLog";
import { reportClientError } from "@/lib/observability/reportClientError";

type EntityAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "IMPORT" | "EXPORT";

function mapEntityAction(action: EntityAction, entity: string): AuditAction {
  if (action === "LOGIN") return "login";
  if (action === "DELETE") return "data.delete";
  if (action === "CREATE" && entity === "client") return "client.create";
  if (action === "UPDATE" && entity === "client") return "client.update";
  // Prefer generic data mutation markers for operational entities
  if (action === "CREATE") return "client.update";
  if (action === "UPDATE") return "client.update";
  if (action === "IMPORT" || action === "EXPORT") return "client.update";
  return "client.update";
}

/**
 * Unified audit writer for feature services.
 * Delegates to writeAuditLog (single schema / collection path).
 */
export class AuditService {
  static async log(
    tenantId: string,
    userId: string,
    action: EntityAction,
    entity: string,
    entityId: string,
    oldValue: unknown = null,
    newValue: unknown = null,
  ) {
    try {
      await writeAuditLog({
        userId,
        tenantId,
        action: mapEntityAction(action, entity),
        detail: `${action} ${entity} ${entityId}`.trim(),
        meta: {
          entity,
          entityId,
          entityAction: action,
          // Avoid storing full document dumps — keep lightweight diffs flags
          hadOldValue: oldValue != null,
          hadNewValue: newValue != null,
        },
      });
    } catch (error) {
      reportClientError("AuditService.log", error, { tenantId, entity, entityId, action });
    }
  }
}
