"use client";

import { useEffect, useState, useMemo } from "react";
import { PaymentService } from "../services/PaymentService";
import { PaymentRecord, PaymentFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";

export function usePayments() {
  const { profile, user } = useAuth();
  const tenantId = profile?.tenantId;
  const userId = user?.uid;

  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new PaymentService(tenantId, userId);
  }, [tenantId, userId]);

  const loadPayments = async () => {
    if (!paymentService) return;
    setIsLoading(true);
    try {
      const data = await paymentService.getAllPayments();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [paymentService]);

  const createPayment = async (data: PaymentFormValues) => {
    if (!paymentService) throw new Error("Service not initialized");
    await paymentService.createPayment(data);
    await loadPayments(); // Refetch after mutation
  };

  const updatePayment = async (id: string, data: Partial<PaymentFormValues>) => {
    if (!paymentService) throw new Error("Service not initialized");
    await paymentService.updatePayment(id, data);
    await loadPayments(); // Refetch after mutation
  };

  const deletePayment = async (id: string) => {
    if (!paymentService) throw new Error("Service not initialized");
    await paymentService.deletePayment(id);
    await loadPayments(); // Refetch after mutation
  };

  return {
    records,
    isLoading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    isConfigured: !!tenantId, // legacy compatibility
    syncState: isLoading ? "Loading..." : "Synced", // legacy compatibility
    errorMessage: error, // legacy compatibility
  };
}
