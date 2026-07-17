"use client";

import { useMemo } from "react";
import { PaymentService } from "../services/PaymentService";
import { PaymentRecord, PaymentFormValues } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { reportClientError } from "@/lib/observability/reportClientError";

export function usePayments() {
  const { user } = useAuth();
  const tenantId = useActiveTenantId();
  const userId = user?.uid;

  const {
    records,
    syncState,
    errorMessage,
    isConfigured,
    isLive,
  } = useFirestoreCollection<PaymentRecord>("payments", [], {
    tenantId,
    orderByField: "month",
    orderDirection: "desc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const paymentService = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new PaymentService(tenantId, userId);
  }, [tenantId, userId]);

  const createPayment = async (data: PaymentFormValues) => {
    if (!paymentService) throw new Error("Service not initialized");
    try {
      return await paymentService.createPayment(data);
    } catch (err) {
      reportClientError("usePayments.createPayment", err, { tenantId });
      throw err;
    }
  };

  const updatePayment = async (id: string, data: Partial<PaymentFormValues>) => {
    if (!paymentService) throw new Error("Service not initialized");
    try {
      await paymentService.updatePayment(id, data);
    } catch (err) {
      reportClientError("usePayments.updatePayment", err, { tenantId, id });
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    if (!paymentService) throw new Error("Service not initialized");
    try {
      await paymentService.deletePayment(id);
    } catch (err) {
      reportClientError("usePayments.deletePayment", err, { tenantId, id });
      throw err;
    }
  };

  return {
    records,
    isLoading: Boolean(tenantId && !isLive && !errorMessage),
    error: errorMessage || null,
    createPayment,
    updatePayment,
    deletePayment,
    isConfigured: isConfigured && !!tenantId,
    syncState,
    errorMessage,
  };
}
