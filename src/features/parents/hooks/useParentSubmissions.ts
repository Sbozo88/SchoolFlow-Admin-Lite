"use client";

import { useMemo, useState } from "react";
import { ParentService } from "../services/ParentService";
import { ParentSubmissionRecord, ParentSubmissionFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { reportClientError } from "@/lib/observability/reportClientError";
import { validatePublicIntake } from "@/lib/forms/publicIntake";

export function useParentSubmissions() {
  const { user } = useAuth();
  const [publicTenantId, setPublicTenantId] = useState<string | null>(null);
  const tenantId = useActiveTenantId(publicTenantId);
  const userId = user?.uid;

  const {
    records,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<ParentSubmissionRecord>("parentSubmissions", [], {
    // Only attach live listener when signed in (admin views)
    tenantId: userId ? tenantId : null,
    orderByField: "createdAt",
    orderDirection: "desc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const parentService = useMemo(() => {
    if (!tenantId) return null;
    return new ParentService(tenantId, userId);
  }, [tenantId, userId]);

  const createSubmission = async (
    data: ParentSubmissionFormValues,
    specificTenantId?: string,
    honeypot?: string,
  ) => {
    const tId = specificTenantId || tenantId;
    if (!tId) throw new Error("No tenant context");

    // Public intake hardening (rate limit, tenant format, honeypot)
    if (!userId) {
      const gate = validatePublicIntake({ tenantId: tId, honeypot });
      if (!gate.ok) {
        if (gate.reason === "honeypot") {
          // Silent fake success for bots
          return "ok";
        }
        throw new Error(gate.reason);
      }
    }

    const service = new ParentService(tId, userId);
    try {
      return await service.submitParentForm(data);
    } catch (err) {
      reportClientError("useParentSubmissions.createSubmission", err, { tenantId: tId });
      throw err;
    }
  };

  const updateSubmissionStatus = async (
    id: string,
    status: "new" | "reviewed" | "converted" | "archived",
  ) => {
    if (!parentService) throw new Error("Service not initialized");
    try {
      await parentService.updateSubmissionStatus(id, status);
    } catch (err) {
      reportClientError("useParentSubmissions.updateSubmissionStatus", err, { tenantId, id });
      throw err;
    }
  };

  return {
    records: userId ? records : [],
    isLoading: Boolean(userId && tenantId && !isLive && !errorMessage),
    error: errorMessage || null,
    createSubmission,
    updateSubmissionStatus,
    setPublicTenantId,
    isConfigured: isConfigured && !!tenantId,
    syncState: userId ? syncState : "Public form mode",
    errorMessage: userId ? errorMessage : "",
  };
}
