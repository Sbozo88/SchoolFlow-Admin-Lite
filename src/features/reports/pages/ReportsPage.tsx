"use client";

import { useState, useMemo } from "react";
import { 
  BarChart3, 
  Download, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  Lock, 
  FileJson, 
  Layers,
  AlertCircle
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useLearners } from "@/features/learners/hooks/useLearners";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, type TableColumn } from "@/components/ui/Table";
import { fullName } from "@/utils/format";

type SelectedMetric = "learners" | "outstanding" | "collection" | "attendance";

export function ReportsPage() {
  const activeTenantId = useActiveTenantId();
  const { records: learners } = useLearners();
  const { records: attendance } = useAttendance();
  const { records: payments } = usePayments();
  const { settings } = useSettings();

  const [selectedCard, setSelectedCard] = useState<SelectedMetric>("learners");
  const [isExportBlockedModalOpen, setIsExportBlockedModalOpen] = useState(false);

  // Demo status detection
  const isDemo = useMemo(() => {
    return Boolean(
      activeTenantId?.startsWith("tenant-demo-") ||
      activeTenantId?.includes("demo")
    );
  }, [activeTenantId]);

  const orgName = settings?.organizationName || "Your School";
  const currencySymbol = settings?.currency || "ZAR";
  const defaultFee = settings?.defaultMonthlyFee || 0;

  // Custom currency formatting that respects organization settings
  const formatCurrencyCustom = (value: number) => {
    try {
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: currencySymbol,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${currencySymbol} ${value.toLocaleString()}`;
    }
  };

  // Metric calculations
  const totalLearners = learners.length;
  
  const totalExpected = payments.reduce((sum: number, p: any) => sum + (p.expectedAmount || 0), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
  const totalOutstanding = Math.max(totalExpected - totalPaid, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  // Text summary download
  const handleDownload = () => {
    const reportText = `
SchoolFlow Admin Lite - Monthly Summary Report
Organization: ${orgName}
Tenant ID: ${activeTenantId || "N/A"}
Date: ${new Date().toLocaleDateString()}
----------------------------------------
Total Active Learners: ${totalLearners}
Overall Attendance Rate: ${attendanceRate}%
Payment Collection Rate: ${collectionRate}%
Total Outstanding Fees: ${formatCurrencyCustom(totalOutstanding)}
Standard Monthly Fee: ${formatCurrencyCustom(defaultFee)}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SchoolFlow-Report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Demo guarded JSON database backup export
  const handleExportJSON = () => {
    if (isDemo) {
      setIsExportBlockedModalOpen(true);
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      tenantId: activeTenantId,
      organization: orgName,
      learners: learners.map(l => ({
        id: l.id,
        firstName: l.firstName,
        lastName: l.lastName,
        className: l.className,
        programme: l.programme,
        instrumentOrActivity: l.instrumentOrActivity,
        parentName: l.parentName,
        parentPhone: l.parentPhone,
        parentEmail: l.parentEmail,
        paymentStatus: l.paymentStatus,
        learnerStatus: l.learnerStatus,
        notes: l.notes,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt
      })),
      payments: payments.map(p => ({
        id: p.id,
        learnerName: p.learnerName,
        month: p.month,
        expectedAmount: p.expectedAmount,
        paidAmount: p.paidAmount,
        balance: p.balance,
        status: p.status,
        paymentDate: p.paymentDate,
        method: p.method,
        reference: p.reference,
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })),
      attendance: attendance.map(a => ({
        id: a.id,
        learnerName: a.learnerName,
        className: a.className,
        programme: a.programme,
        date: a.date,
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })),
      settings: settings ? {
        organizationName: settings.organizationName,
        currency: settings.currency,
        programmes: settings.programmes,
        defaultMonthlyFee: settings.defaultMonthlyFee,
        enrollmentFormEnabled: settings.enrollmentFormEnabled,
      } : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SchoolFlow-Backup-${activeTenantId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Table Columns Definition based on selected card
  const learnersColumns: TableColumn<typeof learners[number]>[] = [
    {
      key: "name",
      header: "Learner Name",
      render: (row) => <span className="font-bold text-slate-900">{fullName(row.firstName, row.lastName)}</span>,
    },
    {
      key: "className",
      header: "Class/Grade",
      render: (row) => <span>{row.className}</span>,
    },
    {
      key: "programme",
      header: "Programme",
      render: (row) => <span className="text-slate-600 font-medium">{row.programme}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const toneMap = {
          active: "green" as const,
          inactive: "slate" as const,
          pending: "amber" as const,
          archived: "rose" as const,
        };
        return <Badge tone={toneMap[row.learnerStatus] || "slate"}>{row.learnerStatus}</Badge>;
      },
    },
  ];

  const outstandingColumns: TableColumn<typeof payments[number]>[] = [
    {
      key: "name",
      header: "Learner Name",
      render: (row) => <span className="font-bold text-slate-900">{row.learnerName}</span>,
    },
    {
      key: "expected",
      header: "Expected Amount",
      render: (row) => <span>{formatCurrencyCustom(row.expectedAmount)}</span>,
    },
    {
      key: "paid",
      header: "Paid Amount",
      render: (row) => <span className="text-emerald-600 font-semibold">{formatCurrencyCustom(row.paidAmount)}</span>,
    },
    {
      key: "outstanding",
      header: "Outstanding Balance",
      render: (row) => <span className="text-rose-600 font-black">{formatCurrencyCustom(row.balance)}</span>,
    },
    {
      key: "month",
      header: "Billing Period",
      render: (row) => <span className="capitalize font-medium">{row.month}</span>,
    },
  ];

  const collectionColumns: TableColumn<typeof payments[number]>[] = [
    {
      key: "name",
      header: "Learner Name",
      render: (row) => <span className="font-bold text-slate-900">{row.learnerName}</span>,
    },
    {
      key: "expected",
      header: "Expected",
      render: (row) => <span>{formatCurrencyCustom(row.expectedAmount)}</span>,
    },
    {
      key: "paid",
      header: "Amount Paid",
      render: (row) => <span className="text-emerald-600 font-semibold">{formatCurrencyCustom(row.paidAmount)}</span>,
    },
    {
      key: "date",
      header: "Payment Date",
      render: (row) => <span className="text-slate-500 font-medium">{row.paymentDate || "Pending"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const toneMap = {
          paid: "green" as const,
          partial: "amber" as const,
          unpaid: "rose" as const,
          overdue: "rose" as const,
        };
        return <Badge tone={toneMap[row.status] || "slate"}>{row.status}</Badge>;
      },
    },
  ];

  const attendanceColumns: TableColumn<typeof attendance[number]>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="font-bold text-slate-900">{row.date}</span>,
    },
    {
      key: "name",
      header: "Learner Name",
      render: (row) => <span className="text-slate-700">{row.learnerName}</span>,
    },
    {
      key: "className",
      header: "Class Name",
      render: (row) => <span className="font-medium text-slate-600">{row.className}</span>,
    },
    {
      key: "status",
      header: "Attendance Status",
      render: (row) => {
        const toneMap = {
          present: "green" as const,
          late: "amber" as const,
          absent: "rose" as const,
          excused: "slate" as const,
        };
        return <Badge tone={toneMap[row.status] || "slate"}>{row.status}</Badge>;
      },
    },
  ];

  const outstandingPayments = useMemo(() => payments.filter(p => p.balance > 0), [payments]);
  const sortedAttendance = useMemo(() => [...attendance].sort((a, b) => b.date.localeCompare(a.date)), [attendance]);

  return (
    <>
      <PageHeader 
        title="Reports & Analytics" 
        description="View high-level health metrics for your organization." 
        action={
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} variant="secondary">
              <FileJson size={16} /> Export JSON
            </Button>
            <Button onClick={handleDownload} variant="primary">
              <Download size={16} /> Download Summary
            </Button>
          </div>
        }
      />
      
      {/* Calculated Tenant Summaries Panel */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-3xl p-6 mt-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge tone={isDemo ? "amber" : "teal"}>
              {isDemo ? "Demo Environment" : "Production Database"}
            </Badge>
            {isDemo && (
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                <AlertCircle size={12} /> Backup guarded
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-800">{orgName}</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            System Tenant ID: <code className="bg-slate-200/60 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[11px] select-all">{activeTenantId || "tenant-undefined"}</code>
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm w-full md:w-auto border-t md:border-t-0 border-slate-200/80 pt-4 md:pt-0">
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Standard Fee</span>
            <span className="font-extrabold text-slate-800 text-lg">{formatCurrencyCustom(defaultFee)}</span>
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Programmes</span>
            <span className="font-extrabold text-slate-800 text-lg">{settings?.programmes?.length || 0} active</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Status</span>
            <span className="font-extrabold text-emerald-600 text-lg flex items-center gap-1">
              Active Sync
            </span>
          </div>
        </div>
      </div>
      
      {/* Selectable Report Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard
          label="Total Learners"
          value={totalLearners}
          icon={Users}
          gradient="from-[#7c6cf0] to-[#4834d4]"
          isSelected={selectedCard === "learners"}
          onClick={() => setSelectedCard("learners")}
        />
        <StatCard
          label="Outstanding Fees"
          value={formatCurrencyCustom(totalOutstanding)}
          icon={CreditCard}
          gradient="from-[#ff6b81] to-[#ee5a24]"
          isSelected={selectedCard === "outstanding"}
          onClick={() => setSelectedCard("outstanding")}
        />
        <StatCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          icon={BarChart3}
          gradient="from-[#2ed573] to-[#10ac84]"
          isSelected={selectedCard === "collection"}
          onClick={() => setSelectedCard("collection")}
        />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          gradient="from-[#a29bfe] to-[#6c5ce7]"
          isSelected={selectedCard === "attendance"}
          onClick={() => setSelectedCard("attendance")}
        />
      </div>

      {/* Metric Breakdown Table Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="text-slate-700" size={20} />
          <h2 className="text-lg font-black text-slate-900 capitalize">
            {selectedCard === "learners" && "Learner Roster Breakdown"}
            {selectedCard === "outstanding" && "Outstanding Debtor Accounts"}
            {selectedCard === "collection" && "Recent Collection Invoices"}
            {selectedCard === "attendance" && "Attendance Audit Logs"}
          </h2>
        </div>

        {selectedCard === "learners" && (
          learners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-semibold">No learner records found.</p>
            </div>
          ) : (
            <Table 
              columns={learnersColumns} 
              rows={learners} 
              getRowKey={(row) => row.id} 
            />
          )
        )}

        {selectedCard === "outstanding" && (
          outstandingPayments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-semibold">No outstanding fees found.</p>
            </div>
          ) : (
            <Table 
              columns={outstandingColumns} 
              rows={outstandingPayments} 
              getRowKey={(row) => row.id} 
            />
          )
        )}

        {selectedCard === "collection" && (
          payments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-semibold">No billing or collections history found.</p>
            </div>
          ) : (
            <Table 
              columns={collectionColumns} 
              rows={payments} 
              getRowKey={(row) => row.id} 
            />
          )
        )}

        {selectedCard === "attendance" && (
          sortedAttendance.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-semibold">No attendance logs found.</p>
            </div>
          ) : (
            <Table 
              columns={attendanceColumns} 
              rows={sortedAttendance} 
              getRowKey={(row) => row.id} 
            />
          )
        )}
      </div>

      <div className="mt-8 bg-slate-900 text-white rounded-2xl p-8 shadow-md">
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

      {/* Export Blocked Modal */}
      <Modal 
        isOpen={isExportBlockedModalOpen} 
        onClose={() => setIsExportBlockedModalOpen(false)} 
        title="Export Guard Active"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="size-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 shadow-inner">
            <Lock size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Export Restricted</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
            Database backups in JSON format are disabled for demo tenant credentials (<code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-bold">{activeTenantId}</code>) to prevent mock resource extraction.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mt-4">
            If you want to use the full data portability suite, please register or switch to a production SchoolFlow tenant.
          </p>
          <div className="mt-6 flex w-full justify-end">
            <Button variant="primary" onClick={() => setIsExportBlockedModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReportsPage;
