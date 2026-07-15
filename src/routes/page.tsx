"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

/**
 * Root entry: send users to the correct workspace (platform vs school),
 * not always /school (old single-tenant behavior).
 */
export default function Home() {
  const { user, loading, isConfigured, homePath, workspace } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConfigured) {
      navigate("/login", { replace: true });
      return;
    }
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (workspace === "none") {
      navigate("/login", { replace: true });
      return;
    }
    navigate(homePath, { replace: true });
  }, [homePath, isConfigured, loading, navigate, user, workspace]);

  return (
    <BrandedLoading
      fullScreen
      title="Opening SchoolFlow"
      detail={
        workspace === "platform"
          ? "Taking you to Super Admin."
          : "Loading your workspace."
      }
    />
  );
}
