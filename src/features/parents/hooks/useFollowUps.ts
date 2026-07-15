"use client";

import { useEffect, useState, useMemo } from "react";
import { ParentService } from "../services/ParentService";
import { FollowUpRecord, FollowUpFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";

export function useFollowUps() {
  const { profile, user } = useAuth();
  const tenantId = profile?.tenantId;
  const userId = user?.uid;

  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new ParentService(tenantId, userId);
  }, [tenantId, userId]);

  const loadFollowUps = async () => {
    if (!parentService) return;
    setIsLoading(true);
    try {
      const data = await parentService.getAllFollowUps();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load follow-ups.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [parentService]);

  const createFollowUp = async (data: FollowUpFormValues) => {
    if (!parentService) throw new Error("Service not initialized");
    await parentService.createFollowUp(data);
    await loadFollowUps();
  };

  const updateFollowUp = async (id: string, updates: Partial<FollowUpRecord>) => {
    if (!parentService) throw new Error("Service not initialized");
    if (updates.status) {
       await parentService.updateFollowUpStatus(id, updates.status as "pending" | "done" | "urgent");
    }
    await loadFollowUps();
  };

  const deleteFollowUp = async (id: string) => {
    if (!parentService) throw new Error("Service not initialized");
    await parentService.deleteFollowUp(id);
    await loadFollowUps();
  };

  return {
    records,
    isLoading,
    error,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    isConfigured: !!tenantId,
    syncState: isLoading ? "Loading..." : "Synced",
    errorMessage: error,
  };
}
