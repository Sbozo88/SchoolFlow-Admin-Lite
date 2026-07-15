"use client";

import { BarChart3, Download, Users, CreditCard, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useLearners } from "@/hooks/useLearners";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/utils/format";

export function ReportsPage() {
  const { records: learners } = useLearners();
  const { records: attendance } = useAttendance();
  const { records: payments } = usePayments();

  // Calculations
  const totalLearners = learners.length;
  
  const totalExpected = payments.reduce((sum, p) => sum + p.expectedAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOutstanding = totalExpected - totalPaid;
  const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const handleDownload = () => {
    const reportText = `
SchoolFlow Admin Lite - Monthly Summary Report
Date: ${new Date().toLocaleDateString()}
----------------------------------------
Total Active Learners: ${totalLearners}
Overall Attendance Rate: ${attendanceRate}%
Payment Collection Rate: ${collectionRate}%
Total Outstanding Fees: ${formatCurrency(totalOutstanding)}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SchoolFlow-Report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader 
        title="Reports & Analytics" 
        description="View high-level health metrics for your organization." 
        action={
          <Button onClick={handleDownload} variant="primary">
            <Download size={16} /> Download Summary
          </Button>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium">
            <Users size={18} className="text-teal-600" /> Total Learners
          </div>
          <h3 className="text-3xl font-black text-slate-900">{totalLearners}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium">
            <CreditCard size={18} className="text-rose-600" /> Outstanding Fees
          </div>
          <h3 className="text-3xl font-black text-slate-900">{formatCurrency(totalOutstanding)}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium">
            <BarChart3 size={18} className="text-blue-600" /> Collection Rate
          </div>
          <h3 className="text-3xl font-black text-slate-900">{collectionRate}%</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium">
            <CalendarCheck size={18} className="text-amber-600" /> Attendance Rate
          </div>
          <h3 className="text-3xl font-black text-slate-900">{attendanceRate}%</h3>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 text-white rounded-xl p-8 shadow-md">
        <h2 className="text-xl font-black flex items-center gap-2">
          <BarChart3 className="text-teal-400" />
          Ready for more?
        </h2>
        <p className="text-slate-300 mt-2 max-w-2xl">
          SchoolFlow Admin Lite provides these essential metrics to keep your administration on track. 
          If you need advanced reporting, multi-branch analytics, or automated PDF generation, 
          contact us to upgrade to SchoolFlow Pro.
        </p>
      </div>
    </>
  );
}

export default ReportsPage;
