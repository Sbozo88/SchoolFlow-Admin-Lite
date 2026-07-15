import { lazy, Suspense, type ComponentProps } from "react";
import type {
  AttendanceTrendChart as AttendanceTrendChartType,
  PaymentStatusChart as PaymentStatusChartType,
  ProgrammeDistributionChart as ProgrammeDistributionChartType,
} from "./DashboardCharts";

const LazyAttendanceTrendChart = lazy(() =>
  import("./DashboardCharts").then((mod) => ({ default: mod.AttendanceTrendChart })),
);
const LazyPaymentStatusChart = lazy(() =>
  import("./DashboardCharts").then((mod) => ({ default: mod.PaymentStatusChart })),
);
const LazyProgrammeDistributionChart = lazy(() =>
  import("./DashboardCharts").then((mod) => ({ default: mod.ProgrammeDistributionChart })),
);

export function AttendanceTrendChart(props: ComponentProps<typeof AttendanceTrendChartType>) {
  return <Suspense fallback={<ChartLoading className="h-[260px] mt-4" />}><LazyAttendanceTrendChart {...props} /></Suspense>;
}

export function PaymentStatusChart(props: ComponentProps<typeof PaymentStatusChartType>) {
  return <Suspense fallback={<ChartLoading className="h-[200px] mt-2" />}><LazyPaymentStatusChart {...props} /></Suspense>;
}

export function ProgrammeDistributionChart(props: ComponentProps<typeof ProgrammeDistributionChartType>) {
  return <Suspense fallback={<ChartLoading className="h-[220px] mt-4" />}><LazyProgrammeDistributionChart {...props} /></Suspense>;
}

function ChartLoading({ className }: { className: string }) {
  return <div className={`${className} w-full rounded-xl bg-slate-50 animate-pulse`} />;
}
