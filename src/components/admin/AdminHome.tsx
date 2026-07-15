"use client";

import { 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  PhoneForwarded, 
  ClipboardList, 
  Plus,
  CheckSquare,
  FileText,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  GraduationCap,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { DashboardCalendar } from "./home/DashboardCalendar";
import { useLearners } from "@/hooks/useLearners";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useParentSubmissions } from "@/hooks/useParentSubmissions";

const quickActions = [
  { label: "Add Learner", icon: Plus, href: "/admin/learners?action=add", gradient: "from-[#6c5ce7] to-[#a29bfe]", shadow: "shadow-[0_4px_15px_rgba(108,92,231,0.3)]" },
  { label: "Mark Attendance", icon: CheckSquare, href: "/admin/attendance", gradient: "from-[#00d2d3] to-[#01a3a4]", shadow: "shadow-[0_4px_15px_rgba(0,210,211,0.3)]" },
  { label: "Record Payment", icon: CreditCard, href: "/admin/payments?action=record", gradient: "from-[#feca57] to-[#f0932b]", shadow: "shadow-[0_4px_15px_rgba(254,202,87,0.3)]" },
  { label: "Create Follow-Up", icon: PhoneForwarded, href: "/admin/parent-follow-ups?action=create", gradient: "from-[#ff6b81] to-[#ee5a24]", shadow: "shadow-[0_4px_15px_rgba(255,107,129,0.3)]" },
  { label: "Generate Report", icon: FileText, href: "/admin/reports", gradient: "from-[#1dd1a1] to-[#10ac84]", shadow: "shadow-[0_4px_15px_rgba(29,209,161,0.3)]" },
  { label: "Review Forms", icon: ClipboardList, href: "/admin/parent-form", gradient: "from-[#a29bfe] to-[#6c5ce7]", shadow: "shadow-[0_4px_15px_rgba(162,155,254,0.3)]" },
];

export function AdminHome() {
  const { records: learners } = useLearners();
  const { records: attendance } = useAttendance();
  const { records: payments } = usePayments();
  const { records: followUps } = useFollowUps();
  const { records: forms } = useParentSubmissions();

  const totalLearners = learners.length;
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const absentToday = attendance.filter((a) => a.status === "absent").length;
  const pendingPayments = payments.filter((p) => p.status === "unpaid" || p.status === "overdue" || p.status === "partial").length;
  const activeFollowUps = followUps.filter((f) => f.status === "pending" || f.status === "urgent").length;
  const newForms = forms.filter((f) => f.status === "new").length;

  const dashboardMetrics = [
    { 
      label: "Total Learners", 
      value: totalLearners.toString(), 
      change: "+12%",
      trend: "up" as const,
      gradient: "from-[#6c5ce7] to-[#4834d4]",
      iconBg: "bg-white/20",
      icon: GraduationCap,
    },
    { 
      label: "Present Today", 
      value: presentToday.toString(), 
      change: "+5%",
      trend: "up" as const,
      gradient: "from-[#1dd1a1] to-[#10ac84]",
      iconBg: "bg-white/20",
      icon: CheckCircle2,
    },
    { 
      label: "Absent Today", 
      value: absentToday.toString(), 
      change: "-3%",
      trend: "down" as const,
      gradient: "from-[#ff6b81] to-[#ee5a24]",
      iconBg: "bg-white/20",
      icon: XCircle,
    },
    { 
      label: "Payments Pending", 
      value: pendingPayments.toString(), 
      change: "+8%",
      trend: "up" as const,
      gradient: "from-[#feca57] to-[#f0932b]",
      iconBg: "bg-white/20",
      icon: CreditCard,
    },
    { 
      label: "Follow-Ups", 
      value: activeFollowUps.toString(), 
      change: "-2",
      trend: "down" as const,
      gradient: "from-[#00d2d3] to-[#01a3a4]",
      iconBg: "bg-white/20",
      icon: PhoneForwarded,
    },
    { 
      label: "New Forms", 
      value: newForms.toString(), 
      change: "+1",
      trend: "up" as const,
      gradient: "from-[#a29bfe] to-[#6c5ce7]",
      iconBg: "bg-white/20",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left Column */}
      <div className="flex-1 space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-[28px] p-8" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #4834d4 50%, #6c5ce7 100%)' }}>
          <div className="relative z-10">
            <p className="text-white/70 text-[14px] font-medium mb-1">Good morning,</p>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-white/60 text-[14px] max-w-md">Here&apos;s what&apos;s happening at your school today. Stay on top of your admin tasks.</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4 size-28 rounded-full bg-white/[0.08]" />
          <div className="absolute top-4 right-24 size-16 rounded-full bg-[#ff6b81]/20" />
          <div className="absolute -bottom-4 left-1/3 size-20 rounded-full bg-[#feca57]/10" />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.label} 
                className={`bg-gradient-to-br ${metric.gradient} p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-11 rounded-2xl flex items-center justify-center ${metric.iconBg} backdrop-blur-sm`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                    {metric.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white/70 mb-1">{metric.label}</p>
                  <p className="text-[32px] font-bold text-white leading-none">{metric.value}</p>
                </div>
                {/* Decorative shape */}
                <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-[13px] text-slate-400 mt-0.5">Shortcuts to common tasks</p>
            </div>
            <button className="text-[#6c5ce7] hover:text-[#4834d4] text-[13px] font-bold flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5"
                >
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${action.gradient} ${action.shadow} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <p className="text-[13px] text-slate-400 mt-0.5">Stay updated with the latest admin actions.</p>
            </div>
            <button className="text-slate-400 hover:text-[#6c5ce7] transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
            {[
              { time: "10:30 AM", date: "24 Jun, 2026", text: "Attendance marked for Grade 4 Music by Sarah.", views: "12", accentColor: "bg-[#1dd1a1]", icon: CheckSquare },
              { time: "09:15 AM", date: "24 Jun, 2026", text: "Payment of $150 recorded for Michael Smith.", views: "8", accentColor: "bg-[#6c5ce7]", icon: CreditCard },
              { time: "Yesterday", date: "23 Jun, 2026", text: "New parent submission received from Jane Doe.", views: "24", accentColor: "bg-[#ff6b81]", icon: ClipboardList },
              { time: "Yesterday", date: "23 Jun, 2026", text: "Follow-up created for Lucas Brown (Unpaid fees).", views: "5", accentColor: "bg-[#feca57]", icon: PhoneForwarded },
            ].map((activity, i) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={i} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f8f7ff] transition-colors ${i !== 3 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl shrink-0 ${activity.accentColor} flex items-center justify-center shadow-sm`}>
                      <ActivityIcon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800 max-w-sm">{activity.text}</p>
                      <p className="text-[12px] text-slate-400 font-medium mt-1">{activity.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 self-start sm:self-auto ml-14 sm:ml-0">
                    <div className="bg-[#eee9ff] text-[#6c5ce7] text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                      {activity.date}
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium">
                        <Eye size={14} /> {activity.views}
                      </div>
                      <button className="hover:text-[#6c5ce7] transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-full xl:w-96 shrink-0 space-y-6">
        <DashboardCalendar />
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <h3 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#6c5ce7]" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {[
              { name: "Staff Meeting", time: "Tomorrow, 9:00 AM", color: "bg-[#6c5ce7]" },
              { name: "Parent-Teacher Day", time: "Jul 8, 2:00 PM", color: "bg-[#ff6b81]" },
              { name: "Term Exams Begin", time: "Jul 15, 8:00 AM", color: "bg-[#feca57]" },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f7ff] transition-colors cursor-pointer">
                <div className={`w-1 h-10 rounded-full ${event.color}`} />
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">{event.name}</p>
                  <p className="text-[12px] text-slate-400">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Community Banner */}
        <div className="rounded-[24px] p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff6b81 0%, #ee5a24 100%)' }}>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-3 leading-tight">Need help organizing<br/>your school?</h3>
            <p className="text-white/80 text-[14px] font-medium mb-6 max-w-[200px]">
              Join the admin community and discover best practices for your dashboard.
            </p>
            <button className="bg-white text-[#ee5a24] px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors shadow-sm">
              Explore now
            </button>
          </div>
          
          {/* Abstract background graphics */}
          <div className="absolute -bottom-10 -right-10 size-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-10 -right-4 size-24 bg-white/5 rounded-full" />
          <div className="absolute -top-6 -left-6 size-20 rounded-full bg-[#feca57]/20" />
        </div>
      </div>
    </div>
  );
}
