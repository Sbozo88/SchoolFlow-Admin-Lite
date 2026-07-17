"use client";

import { useMemo } from "react";
import { ParentService } from "../services/ParentService";
import { FollowUpRecord, FollowUpFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { reportClientError } from "@/lib/observability/reportClientError";

export function useFollowUps() {
  const { user } = useAuth();
  const tenantId = useActiveTenantId();
  const userId = user?.uid;

  const {
    records,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<FollowUpRecord>("followUps", [], {
    tenantId,
    orderByField: "createdAt",
    orderDirection: "asc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const parentService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new ParentService(tenantId, userId);
  }, [tenantId, userId]);

  const createFollowUp = async (data: FollowUpFormValues) => {
    if (!parentService) throw new Error("Service not initialized");
    try {
      return await parentService.createFollowUp(data);
    } catch (err) {
      reportClientError("useFollowUps.createFollowUp", err, { tenantId });
      throw err;
    }
  };

  const updateFollowUp = async (id: string, updates: Partial<FollowUpRecord>) => {
    if (!parentService) throw new Error("Service not initialized");
    try {
      if (updates.status) {
        await parentService.updateFollowUpStatus(id, updates.status as "pending" | "done" | "urgent");
      }
    } catch (err) {
      reportClientError("useFollowUps.updateFollowUp", err, { tenantId, id });
      throw err;
    }
  };

  const deleteFollowUp = async (id: string) => {
    if (!parentService) throw new Error("Service not initialized");
    try {
      await parentService.deleteFollowUp(id);
    } catch (err) {
      reportClientError("useFollowUps.deleteFollowUp", err, { tenantId, id });
      throw err;
    }
  };

  return {
    records,
    isLoading: Boolean(tenantId && !isLive && !errorMessage),
    error: errorMessage || null,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    isConfigured: isConfigured && !!tenantId,
    syncState,
    errorMessage,
  };
}
