"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

/**
 * Root entry: send users to the correct workspace (platform vs school),
 * not always /admin (old single-tenant behavior).
 */
export default function Home() {
  const { user, loading, isConfigured, homePath, workspace } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isConfigured) {
      router.replace("/login");
      return;
    }
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (workspace === "none") {
      router.replace("/login");
      return;
    }
    router.replace(homePath);
  }, [homePath, isConfigured, loading, router, user, workspace]);

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
