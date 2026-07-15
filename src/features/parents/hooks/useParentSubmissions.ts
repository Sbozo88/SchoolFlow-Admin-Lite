"use client";

import { useEffect, useState, useMemo } from "react";
import { ParentService } from "../services/ParentService";
import { ParentSubmissionRecord, ParentSubmissionFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { usePlatformTenants } from "@/hooks/usePlatformTenants"; // legacy

export function useParentSubmissions() {
  const { profile, user } = useAuth();
  // If public route, we might not have a profile, we might get tenantId from URL
  const [publicTenantId, setPublicTenantId] = useState<string | null>(null);
  
  const tenantId = profile?.tenantId || publicTenantId;
  const userId = user?.uid;

  const [records, setRecords] = useState<ParentSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentService = useMemo(() => {
    if (!tenantId) return null;
    return new ParentService(tenantId, userId);
  }, [tenantId, userId]);

  const loadSubmissions = async () => {
    if (!parentService || !userId) return; // Only load if logged in
    setIsLoading(true);
    try {
      const data = await parentService.getAllSubmissions();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadSubmissions();
  }, [parentService, userId]);

  const createSubmission = async (data: ParentSubmissionFormValues, specificTenantId?: string) => {
    const tId = specificTenantId || tenantId;
    if (!tId) throw new Error("No tenant context");
    const service = new ParentService(tId, userId);
    await service.submitParentForm(data);
    if (userId) await loadSubmissions(); 
  };

  const updateSubmissionStatus = async (id: string, status: "new" | "reviewed" | "converted" | "archived") => {
    if (!parentService) throw new Error("Service not initialized");
    await parentService.updateSubmissionStatus(id, status);
    await loadSubmissions();
  };

  return {
    records,
    isLoading,
    error,
    createSubmission,
    updateSubmissionStatus,
    setPublicTenantId,
    isConfigured: !!tenantId, 
    syncState: isLoading ? "Loading..." : "Synced", 
    errorMessage: error, 
  };
}
