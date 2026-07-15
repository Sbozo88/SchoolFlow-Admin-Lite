"use client";

import { useEffect, useState, useMemo } from "react";
import { AttendanceService } from "../services/AttendanceService";
import { AttendanceRecord, AttendanceFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";

export function useAttendance() {
  const { profile, user } = useAuth();
  const tenantId = profile?.tenantId;
  const userId = user?.uid;

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const attendanceService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new AttendanceService(tenantId, userId);
  }, [tenantId, userId]);

  const loadAttendance = async () => {
    if (!attendanceService) return;
    setIsLoading(true);
    try {
      const data = await attendanceService.getAllAttendance();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [attendanceService]);

  const createAttendance = async (data: AttendanceFormValues) => {
    if (!attendanceService) throw new Error("Service not initialized");
    await attendanceService.createAttendance(data);
    await loadAttendance(); // Refetch after mutation
  };

  const updateAttendance = async (id: string, data: Partial<AttendanceFormValues>) => {
    if (!attendanceService) throw new Error("Service not initialized");
    await attendanceService.updateAttendance(id, data);
    await loadAttendance(); // Refetch after mutation
  };

  const deleteAttendance = async (id: string) => {
    if (!attendanceService) throw new Error("Service not initialized");
    await attendanceService.deleteAttendance(id);
    await loadAttendance(); // Refetch after mutation
  };

  return {
    records,
    isLoading,
    error,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    isConfigured: !!tenantId, // legacy compatibility
    syncState: isLoading ? "Loading..." : "Synced", // legacy compatibility
    errorMessage: error, // legacy compatibility
  };
}
