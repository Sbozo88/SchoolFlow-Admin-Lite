"use client";

import dynamic from "next/dynamic";

export const AttendanceTrendChart = dynamic(
  () => import("./DashboardCharts").then((mod) => mod.AttendanceTrendChart),
  { ssr: false, loading: () => <div className="h-[260px] w-full mt-4 bg-slate-50 rounded-xl animate-pulse" /> }
);

export const PaymentStatusChart = dynamic(
  () => import("./DashboardCharts").then((mod) => mod.PaymentStatusChart),
  { ssr: false, loading: () => <div className="h-[200px] w-full mt-2 bg-slate-50 rounded-xl animate-pulse" /> }
);

export const ProgrammeDistributionChart = dynamic(
  () => import("./DashboardCharts").then((mod) => mod.ProgrammeDistributionChart),
  { ssr: false, loading: () => <div className="h-[220px] w-full mt-4 bg-slate-50 rounded-xl animate-pulse" /> }
);
