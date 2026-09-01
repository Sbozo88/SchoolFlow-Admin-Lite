"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DEFAULT_COLLECTION_LIMIT } from "@/lib/data/queryLimits";
import { ProgrammeService } from "../services/ProgrammeService";
import type { Programme, ProgrammeFormValues, ProgrammeGroup, ProgrammeGroupFormValues } from "../types";

export function useProgrammes() {
  const { user } = useAuth();
  const tenantId = useActiveTenantId();
  const userId = user?.uid;

  const programmesState = useFirestoreCollection<Programme>("programmes", [], {
    tenantId,
    orderByField: "name",
    orderDirection: "asc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });
  const groupsState = useFirestoreCollection<ProgrammeGroup>("programmeGroups", [], {
    tenantId,
    orderByField: "name",
    orderDirection: "asc",
    limitCount: DEFAULT_COLLECTION_LIMIT,
  });

  const service = useMemo(() => {
    if (!tenantId || !userId) return null;
    return new ProgrammeService(tenantId, userId);
  }, [tenantId, userId]);

  return {
    programmes: programmesState.records,
    groups: groupsState.records,
    syncState: programmesState.syncState,
    errorMessage: programmesState.errorMessage || groupsState.errorMessage,
    isConfigured: programmesState.isConfigured && groupsState.isConfigured && !!tenantId,
    createProgramme: (data: ProgrammeFormValues) => {
      if (!service) throw new Error("Service not initialized");
      return service.createProgramme(data);
    },
    updateProgramme: (id: string, data: Partial<ProgrammeFormValues>) => {
      if (!service) throw new Error("Service not initialized");
      return service.updateProgramme(id, data);
    },
    deleteProgramme: (id: string) => {
      if (!service) throw new Error("Service not initialized");
      return service.deleteProgramme(id);
    },
    createGroup: (data: ProgrammeGroupFormValues) => {
      if (!service) throw new Error("Service not initialized");
      return service.createGroup(data);
    },
  };
}
