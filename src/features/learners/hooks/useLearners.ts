"use client";

import { useEffect, useState, useMemo } from "react";
import { LearnerService } from "../services/LearnerService";
import { Learner, LearnerFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";

export function useLearners() {
  const { profile, user } = useAuth();
  const tenantId = profile?.tenantId;
  const userId = user?.uid;

  const [records, setRecords] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learnerService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new LearnerService(tenantId, userId);
  }, [tenantId, userId]);

  const loadLearners = async () => {
    if (!learnerService) return;
    setIsLoading(true);
    try {
      const data = await learnerService.getAllLearners();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load learners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearners();
  }, [learnerService]);

  const createLearner = async (data: LearnerFormValues) => {
    if (!learnerService) throw new Error("Service not initialized");
    await learnerService.createLearner(data);
    await loadLearners(); // Refetch after mutation
  };

  const updateLearner = async (id: string, data: Partial<LearnerFormValues>) => {
    if (!learnerService) throw new Error("Service not initialized");
    await learnerService.updateLearner(id, data);
    await loadLearners(); // Refetch after mutation
  };

  const deleteLearner = async (id: string) => {
    if (!learnerService) throw new Error("Service not initialized");
    await learnerService.deleteLearner(id);
    await loadLearners(); // Refetch after mutation
  };

  return {
    records,
    isLoading,
    error,
    createLearner,
    updateLearner,
    deleteLearner,
    isConfigured: !!tenantId, // legacy compatibility
    syncState: isLoading ? "Loading..." : "Synced", // legacy compatibility
    errorMessage: error, // legacy compatibility
  };
}
