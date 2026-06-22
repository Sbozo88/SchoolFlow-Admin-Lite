"use client";

import { 
  GraduationCap, 
  UserCheck, 
  CreditCard, 
  Inbox,
  Users,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

import { useLearners } from "@/hooks/useLearners";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useParentSubmissions } from "@/hooks/useParentSubmissions";
import { useRecentActivity } from "@/hooks/useRecentActivity";

import { AttendanceTrendChart, PaymentStatusChart, ProgrammeDistributionChart } from "./DashboardChartsLazy";
import { DashboardCalendar } from "./DashboardCalendar";

export function AdminHome() {
  const { records: learners } = useLearners();
  const { records: attendance } = useAttendance();
  const { records: payments } = usePayments();
  const { records: followUps } = useFollowUps();
  const { records: submissions } = useParentSubmissions();
  const { records: activities } = useRecentActivity();

  const totalLearners = learners.filter(l => l.learnerStatus === "active").length;
  
  const today = new Date().toISOString().split("T")[0];
  const todaysAttendance = attendance.filter(a => a.date === today);
  const presentToday = todaysAttendance.filter(a => a.status === "present" || a.status === "late").length;

  const paymentsPending = payments.filter(p => p.status === "unpaid" || p.status === "partial").length;
  const newSubmissions = submissions.filter(s => s.status === "new").length;

  // Chart Data preparation
  const attendanceTrendData = [
    { name: "Mon", present: 85, absent: 5 },
    { name: "Tue", present: 88, absent: 2 },
    { name: "Wed", present: 82, absent: 8 },
    { name: "Thu", present: 89, absent: 1 },
    { name: "Fri", present: 90, absent: 0 },
    { name: "Sat", present: 45, absent: 12 },
  ]; // Mock data for now to match the beautiful chart visually

  const paymentData = [
    { name: "Paid", value: payments.filter(p => p.status === "paid").length || 60 },
    { name: "Unpaid", value: payments.filter(p => p.status === "unpaid").length || 35 },
    { name: "Overdue", value: payments.filter(p => p.status === "overdue").length || 5 },
  ];

  // Group learners by programme for the bar chart
  const programmeCounts = learners.reduce((acc, curr) => {
    if (curr.programme) {
      acc[curr.programme] = (acc[curr.programme] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const programmeData = Object.entries(programmeCounts).map(([name, count]) => ({
    name: name.length > 10 ? name.substring(0,10) + '...' : name, 
    learners: count
  })).sort((a, b) => b.learners - a.learners).slice(0, 5);

  if (programmeData.length === 0) {
    // fallback for demo visuals
    programmeData.push(
      { name: "Mathematics", learners: 80 },
      { name: "English", learners: 92 },
      { name: "Physics", learners: 75 },
      { name: "Science", learners: 60 }
    );
  }

  return (
    <div className="pb-10 pt-4">
      
      {/* Top Summary Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <SummaryCard 
          title="Total Learners" 
          value={totalLearners} 
          icon={GraduationCap} 
          gradient="bg-gradient-to-r from-orange-400 to-orange-300"
          shadow="shadow-lg shadow-orange-500/20"
        />
        <SummaryCard 
          title="Present Today" 
          value={presentToday} 
          icon={UserCheck} 
          gradient="bg-gradient-to-r from-indigo-500 to-indigo-400"
          shadow="shadow-lg shadow-indigo-500/20"
        />
        <SummaryCard 
          title="Payments Pending" 
          value={paymentsPending} 
          icon={CreditCard} 
          gradient="bg-gradient-to-r from-cyan-400 to-cyan-300"
          shadow="shadow-lg shadow-cyan-500/20"
        />
        <SummaryCard 
          title="New Submissions" 
          value={newSubmissions} 
          icon={Inbox} 
          gradient="bg-gradient-to-r from-[#2B3674] to-[#111C44]"
          shadow="shadow-lg shadow-slate-900/20"
        />
      </section>

      {/* Row 2 */}
      <section className="grid gap-6 lg:grid-cols-4 mb-8">
        <Card className="col-span-2 p-6 rounded-3xl border-none shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Attendance Trend</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</span>
              <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</span>
            </div>
          </div>
          <AttendanceTrendChart data={attendanceTrendData} />
        </Card>

        <Card className="col-span-1 p-6 rounded-3xl border-none shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Payment Status</h3>
          </div>
          <PaymentStatusChart data={paymentData} />
          <div className="flex justify-center gap-4 mt-6 w-full">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-[#00C49F]"></div> Paid</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-[#FF8042]"></div> Unpaid</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-[#FFBB28]"></div> Overdue</span>
          </div>
        </Card>

        <div className="col-span-1">
          <DashboardCalendar />
        </div>
      </section>

      {/* Row 3 */}
      <section className="grid gap-6 lg:grid-cols-4">
        <Card className="col-span-2 p-6 rounded-3xl border-none shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Learners by Programme</h3>
            <div className="flex gap-2">
               {/* Tiny legend items matching image */}
               {["#F97316", "#8B5CF6", "#06B6D4", "#1E293B", "#10B981"].map((c, i) => (
                  <div key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{backgroundColor: c}}></div><span className="text-[9px] text-slate-400">Prog{i+1}</span></div>
               ))}
            </div>
          </div>
          <ProgrammeDistributionChart data={programmeData} />
        </Card>

        <Card className="col-span-1 p-6 rounded-3xl border-none shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Follow-Ups</h3>
            <button className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md hover:bg-slate-100">
              Urgent <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {followUps.slice(0, 3).map((f) => (
              <div key={f.id} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="size-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-white shadow-sm">
                  {f.parentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{f.parentName}</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate">For {f.learnerName}</p>
                </div>
              </div>
            ))}
            {followUps.length === 0 && (
               <p className="text-sm text-slate-400 text-center py-4">No follow-ups needed.</p>
            )}
          </div>
        </Card>

        <Card className="col-span-1 p-6 rounded-3xl border-none shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Activity</h3>
            <Link href="/admin/setup-sprint" className="text-[11px] font-bold text-slate-400 hover:text-orange-500">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {activities.slice(0, 3).map((act, i) => (
              <div key={act.id} className="flex gap-3">
                <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${i%2===0 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {i%2===0 ? <Users size={18} /> : <CreditCard size={18} />}
                </div>
                <div className="min-w-0 flex-1 border-b border-slate-50 pb-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, gradient, shadow }: { title: string, value: number | string, icon: React.ElementType, gradient: string, shadow: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 ${gradient} ${shadow} text-white flex justify-between items-center group transition-transform hover:-translate-y-1`}>
      <div className="z-10">
        <p className="text-3xl font-black mb-1">{value}</p>
        <p className="text-sm font-medium opacity-90">{title}</p>
      </div>
      <div className="size-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
        <Icon size={26} className="text-white" strokeWidth={2.5} />
      </div>
      {/* Decorative background shapes */}
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
      <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-black/10 blur-xl" />
    </div>
  );
}

export default AdminHome;
