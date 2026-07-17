"use client";

import { useMemo } from "react";
import { AttendanceService } from "../services/AttendanceService";
import { AttendanceRecord, AttendanceFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { reportClientError } from "@/lib/observability/reportClientError";

export function useAttendance() {
  const { user } = useAuth();
  const tenantId = useActiveTenantId();
  const userId = user?.uid;

  const {
    records,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<AttendanceRecord>("attendance", [], {
    tenantId,
    orderByField: "date",
    orderDirection: "desc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const attendanceService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new AttendanceService(tenantId, userId);
  }, [tenantId, userId]);

  const createAttendance = async (data: AttendanceFormValues) => {
    if (!attendanceService) throw new Error("Service not initialized");
    try {
      return await attendanceService.createAttendance(data);
    } catch (err) {
      reportClientError("useAttendance.createAttendance", err, { tenantId });
      throw err;
    }
  };

  const updateAttendance = async (id: string, data: Partial<AttendanceFormValues>) => {
    if (!attendanceService) throw new Error("Service not initialized");
    try {
      await attendanceService.updateAttendance(id, data);
    } catch (err) {
      reportClientError("useAttendance.updateAttendance", err, { tenantId, id });
      throw err;
    }
  };

  const deleteAttendance = async (id: string) => {
    if (!attendanceService) throw new Error("Service not initialized");
    try {
      await attendanceService.deleteAttendance(id);
    } catch (err) {
      reportClientError("useAttendance.deleteAttendance", err, { tenantId, id });
      throw err;
    }
  };

  return {
    records,
    isLoading: Boolean(tenantId && !isLive && !errorMessage),
    error: errorMessage || null,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    isConfigured: isConfigured && !!tenantId,
    syncState,
    errorMessage,
  };
}
