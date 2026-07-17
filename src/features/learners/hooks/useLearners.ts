"use client";

import { useMemo } from "react";
import { LearnerService } from "../services/LearnerService";
import { Learner, LearnerFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { reportClientError } from "@/lib/observability/reportClientError";

export function useLearners() {
  const { user } = useAuth();
  const tenantId = useActiveTenantId();
  const userId = user?.uid;

  const {
    records,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<Learner>("learners", [], {
    tenantId,
    orderByField: "lastName",
    orderDirection: "asc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const learnerService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new LearnerService(tenantId, userId);
  }, [tenantId, userId]);

  const createLearner = async (data: LearnerFormValues) => {
    if (!learnerService) throw new Error("Service not initialized");
    try {
      return await learnerService.createLearner(data);
    } catch (err) {
      reportClientError("useLearners.createLearner", err, { tenantId });
      throw err;
    }
  };

  const updateLearner = async (id: string, data: Partial<LearnerFormValues>) => {
    if (!learnerService) throw new Error("Service not initialized");
    try {
      await learnerService.updateLearner(id, data);
    } catch (err) {
      reportClientError("useLearners.updateLearner", err, { tenantId, id });
      throw err;
    }
  };

  const deleteLearner = async (id: string) => {
    if (!learnerService) throw new Error("Service not initialized");
    try {
      await learnerService.deleteLearner(id);
    } catch (err) {
      reportClientError("useLearners.deleteLearner", err, { tenantId, id });
      throw err;
    }
  };

  return {
    records,
    isLoading: Boolean(tenantId && !isLive && !errorMessage),
    error: errorMessage || null,
    createLearner,
    updateLearner,
    deleteLearner,
    isConfigured: isConfigured && !!tenantId,
    syncState,
    errorMessage,
  };
}
