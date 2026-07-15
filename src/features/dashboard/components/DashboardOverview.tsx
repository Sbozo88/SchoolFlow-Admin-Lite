"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  PhoneForwarded,
  XCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardCalendar } from "./DashboardCalendar";
import { StatCard } from "@/components/ui/StatCard";
import { WelcomeCard } from "@/components/ui/WelcomeCard";
import { QuickActionButton } from "@/components/ui/QuickActionButton";
import {
  SCHOOL_KPI_LABELS,
  SCHOOL_QUICK_ACTIONS,
} from "@/components/admin/dashboardPresentation";
import { useLearners } from "@/features/learners/hooks/useLearners";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useFollowUps } from "@/features/parents/hooks/useFollowUps";
import { useParentSubmissions } from "@/features/parents/hooks/useParentSubmissions";

const kpiIcons = {
  "Total Learners": GraduationCap,
  "Present Today": CheckCircle2,
  "Absent Today": XCircle,
  "Payments Pending": CreditCard,
  "Follow-Ups": PhoneForwarded,
  "New Forms": ClipboardList,
} as const;

const kpiStyles: Record<
  (typeof SCHOOL_KPI_LABELS)[number],
  { gradient: string; change: string; trend: "up" | "down" }
> = {
  "Total Learners": { gradient: "from-[#7c6cf0] to-[#4834d4]", change: "+12%", trend: "up" },
  "Present Today": { gradient: "from-[#2ed573] to-[#10ac84]", change: "+5%", trend: "up" },
  "Absent Today": { gradient: "from-[#ff6b81] to-[#ee5a24]", change: "-3%", trend: "down" },
  "Payments Pending": { gradient: "from-[#feca57] to-[#f0932b]", change: "+8%", trend: "up" },
  "Follow-Ups": { gradient: "from-[#1dd1a1] to-[#00b894]", change: "-2", trend: "down" },
  "New Forms": { gradient: "from-[#a29bfe] to-[#6c5ce7]", change: "+1", trend: "up" },
};

export function DashboardOverview() {
  const { pathname } = useLocation();
  const { profile, user } = useAuth();
  const { records: learners } = useLearners();
  const { records: attendance } = useAttendance();
  const { records: payments } = usePayments();
  const { records: followUps } = useFollowUps();
  const { records: forms } = useParentSubmissions();

  const totalLearners = learners.length;
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const absentToday = attendance.filter((a) => a.status === "absent").length;
  const pendingPayments = payments.filter(
    (p) => p.status === "unpaid" || p.status === "overdue" || p.status === "partial",
  ).length;
  const activeFollowUps = followUps.filter((f) => f.status === "pending" || f.status === "urgent").length;
  const newForms = forms.filter((f) => f.status === "new").length;

  const values: Record<(typeof SCHOOL_KPI_LABELS)[number], number> = {
    "Total Learners": totalLearners,
    "Present Today": presentToday,
    "Absent Today": absentToday,
    "Payments Pending": pendingPayments,
    "Follow-Ups": activeFollowUps,
    "New Forms": newForms,
  };

  const firstName =
    (profile?.displayName || user?.displayName || "Admin").split(/\s+/)[0] || "Admin";

  const isBrightFutures = profile?.tenantId === "demo-brightfutures";
  const upcomingEvents = isBrightFutures
    ? [
        { name: "Parent Teacher Day", time: "Jul 8, 2:00 PM", color: "bg-[#ff6b81]" },
        { name: "Sports Day", time: "Jul 15, 8:00 AM", color: "bg-[#feca57]" },
        { name: "Term Exams", time: "Jul 20, 9:00 AM", color: "bg-[#00d2d3]" },
        { name: "School Assembly", time: "Jul 25, 10:00 AM", color: "bg-[#a29bfe]" },
      ]
    : [
        { name: "Ubuntu Staff Briefing", time: "Tomorrow, 8:00 AM", color: "bg-[#6c5ce7]" },
        { name: "Science Fair", time: "Aug 2, 10:00 AM", color: "bg-[#1dd1a1]" },
        { name: "Choir Practice", time: "Aug 5, 3:00 PM", color: "bg-[#ff9f43]" },
      ];

  return (
    <div className="flex flex-col gap-7 xl:flex-row xl:gap-8">
      <div className="min-w-0 flex-1 space-y-7">
        {/* Welcome banner — reference purple card */}
        <WelcomeCard
          greeting="Good morning,"
          title={`Welcome back, ${firstName === "Admin" ? "Admin" : firstName}! 👋`}
          subtitle="Here's what's happening at your school today. Stay on top of your admin tasks."
        />

        {/* Six KPI tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {SCHOOL_KPI_LABELS.map((label) => {
            const Icon = kpiIcons[label];
            const style = kpiStyles[label];
            return (
              <StatCard
                key={label}
                label={label}
                value={values[label]}
                icon={Icon}
                gradient={style.gradient}
                trend={style.trend}
                change={style.change}
              />
            );
          })}
        </div>

        {/* Quick Actions — white cards like reference */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">Quick Actions</h2>
              <p className="mt-0.5 text-[13px] text-slate-400">Shortcuts to common tasks</p>
            </div>
            <Link
              to={`${pathname.startsWith("/demo") ? "/demo" : "/school"}/learners`}
              className="flex items-center gap-1 text-[13px] font-bold text-[#6c5ce7] transition-colors hover:text-[#4834d4]"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCHOOL_QUICK_ACTIONS.slice(0, 3).map((action) => (
              <QuickActionButton
                key={action.label}
                label={action.label}
                href={action.href.replace("/school", pathname.startsWith("/demo") ? "/demo" : "/school")}
                icon={action.icon}
                gradient={action.gradient}
                shadow={action.shadow}
                size="large"
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCHOOL_QUICK_ACTIONS.slice(3).map((action) => (
              <QuickActionButton
                key={action.label}
                label={action.label}
                href={action.href.replace("/school", pathname.startsWith("/demo") ? "/demo" : "/school")}
                icon={action.icon}
                gradient={action.gradient}
                shadow={action.shadow}
                size="small"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right column: calendar + events */}
      <div className="w-full shrink-0 space-y-5 xl:w-[340px]">
        <DashboardCalendar />

        <div className="rounded-[24px] border border-slate-100/80 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <h3 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-slate-900">
            <Calendar size={18} className="text-[#6c5ce7]" />
            Upcoming Events
          </h3>
          <div className="space-y-2.5">
            {upcomingEvents.map((event) => (
              <div
                key={event.name}
                className="flex cursor-default items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-[#f8f7ff]"
              >
                <div className={`h-10 w-1 rounded-full ${event.color}`} />
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">{event.name}</p>
                  <p className="text-[12px] text-slate-400">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
