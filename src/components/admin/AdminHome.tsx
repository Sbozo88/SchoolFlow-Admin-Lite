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
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardCalendar } from "./home/DashboardCalendar";
import {
  SCHOOL_KPI_LABELS,
  SCHOOL_QUICK_ACTIONS,
  SCHOOL_UPCOMING_EVENTS,
} from "@/components/admin/dashboardPresentation";
import { useLearners } from "@/hooks/useLearners";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useParentSubmissions } from "@/hooks/useParentSubmissions";

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

export function AdminHome() {
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

  return (
    <div className="flex flex-col gap-7 xl:flex-row xl:gap-8">
      <div className="min-w-0 flex-1 space-y-7">
        {/* Welcome banner — reference purple card */}
        <div
          className="relative overflow-hidden rounded-[28px] px-7 py-8 shadow-lg sm:px-8"
          style={{
            background: "linear-gradient(125deg, #7c6cf0 0%, #5b4bdb 48%, #6c5ce7 100%)",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <p className="mb-1 text-[14px] font-medium text-white/70">Good morning,</p>
            <h1 className="mb-2 text-[26px] font-bold tracking-tight text-white sm:text-[28px]">
              Welcome back, {firstName === "Admin" ? "Admin" : firstName}! 👋
            </h1>
            <p className="max-w-md text-[14px] font-medium leading-relaxed text-white/65">
              Here&apos;s what&apos;s happening at your school today. Stay on top of your admin tasks.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/[0.07]" />
          <div className="absolute -bottom-12 right-16 size-36 rounded-full bg-white/[0.06]" />
          <div className="absolute right-28 top-6 size-14 rounded-full bg-[#ff6b81]/25" />
          <div className="absolute bottom-4 left-[40%] size-16 rounded-full bg-[#feca57]/15" />
        </div>

        {/* Six KPI tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {SCHOOL_KPI_LABELS.map((label) => {
            const Icon = kpiIcons[label];
            const style = kpiStyles[label];
            return (
              <div
                key={label}
                className={`relative flex min-h-[138px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${style.gradient} p-5 shadow-[0_10px_28px_rgba(72,52,212,0.14)] transition-transform duration-300 hover:scale-[1.02] sm:p-6`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold text-white">
                    {style.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {style.change}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-medium text-white/75">{label}</p>
                  <p className="text-[32px] font-bold leading-none tracking-tight text-white">
                    {values[label]}
                  </p>
                </div>
                <div className="absolute -bottom-8 -right-8 size-28 rounded-full bg-white/[0.08]" />
              </div>
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
              href="/admin/learners"
              className="flex items-center gap-1 text-[13px] font-bold text-[#6c5ce7] transition-colors hover:text-[#4834d4]"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCHOOL_QUICK_ACTIONS.slice(0, 3).map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3.5 rounded-[22px] border border-slate-100/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(108,92,231,0.12)]"
                >
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} ${action.shadow} transition-transform group-hover:scale-105`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">{action.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCHOOL_QUICK_ACTIONS.slice(3).map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3.5 rounded-[22px] border border-slate-100/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(108,92,231,0.12)]"
                >
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} ${action.shadow} transition-transform group-hover:scale-105`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">{action.label}</span>
                </Link>
              );
            })}
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
            {SCHOOL_UPCOMING_EVENTS.map((event) => (
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
