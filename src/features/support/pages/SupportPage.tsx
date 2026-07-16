"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSupportChecks } from "@/hooks/useSupportChecks";
import { Select } from "@/components/ui/Select";
import { useTenant } from "@/components/tenant/TenantProvider";

export function SupportPage() {
  const { records: checks, updateSupportCheck, createSupportCheck } = useSupportChecks();
  const { canWrite } = useTenant();
  
  // Sort descending by month
  const sortedChecks = [...checks].sort((a, b) => b.month.localeCompare(a.month));
  const currentMonthCheck = sortedChecks[0];

  const handleToggle = (field: "attendanceReviewed" | "paymentsReviewed" | "followUpsReviewed" | "missingInfoReviewed" | "reportsUpdated") => {
    if (currentMonthCheck && canWrite) {
      updateSupportCheck(currentMonthCheck.id, { [field]: !currentMonthCheck[field] });
    }
  };

  const handleCreateNewMonth = () => {
    if (!canWrite) return;
    const monthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    createSupportCheck({
      month: monthStr,
      attendanceReviewed: false,
      paymentsReviewed: false,
      followUpsReviewed: false,
      missingInfoReviewed: false,
      reportsUpdated: false,
      status: "not_started",
    });
  };

  return (
    <>
      <PageHeader
        title="Monthly Support"
        description="R750/month recurring support offer. Complete the monthly admin health checklist."
        action={
          <Button onClick={handleCreateNewMonth} disabled={!canWrite}>Start New Month</Button>
        }
      />

      {!canWrite && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <span>Viewing workspace in read-only mode. Changes cannot be saved.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {currentMonthCheck ? (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Health Checklist: {currentMonthCheck.month}</h2>
                <Select 
                  value={currentMonthCheck.status}
                  onChange={(e) => updateSupportCheck(currentMonthCheck.id, { status: e.target.value as "not_started" | "in_progress" | "complete" })}
                  className="w-40"
                  disabled={!canWrite}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                </Select>
              </div>

              <div className="grid gap-3">
                {[
                  { field: "attendanceReviewed", label: "Attendance records reviewed and updated" },
                  { field: "paymentsReviewed", label: "Payments reconciled and statuses updated" },
                  { field: "followUpsReviewed", label: "Follow-up centre tasks cleared or created" },
                  { field: "missingInfoReviewed", label: "Missing information requests sent" },
                  { field: "reportsUpdated", label: "Monthly reports generated and saved" },
                ].map(({ field, label }) => (
                  <label key={field} className={`flex items-center gap-3 p-3 rounded-lg border border-slate-100 transition ${canWrite ? "hover:bg-slate-50 cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 disabled:opacity-50" 
                      checked={!!currentMonthCheck[field as keyof typeof currentMonthCheck]}
                      onChange={() => handleToggle(field as "attendanceReviewed" | "paymentsReviewed" | "followUpsReviewed" | "missingInfoReviewed" | "reportsUpdated")}
                      disabled={!canWrite}
                    />
                    <span className="text-slate-700 font-medium">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Next Month Recommendations</label>
                <textarea
                  className="w-full min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="E.g. Address the repeat absentees in the Junior Music class."
                  value={currentMonthCheck.recommendations || ""}
                  onChange={(e) => updateSupportCheck(currentMonthCheck.id, { recommendations: e.target.value })}
                  disabled={!canWrite}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900">No support checks found</h2>
              <p className="text-slate-500 mt-2">Start a new month to begin the recurring support process.</p>
              <Button onClick={handleCreateNewMonth} disabled={!canWrite} className="mt-4">Start New Month</Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Past Months</h3>
            <div className="space-y-3">
              {sortedChecks.slice(1).map(check => (
                <div key={check.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">{check.month}</span>
                  <Badge tone={check.status === "complete" ? "green" : "amber"}>{check.status}</Badge>
                </div>
              ))}
              {sortedChecks.length <= 1 && (
                <p className="text-sm text-slate-500 text-center py-2">No history available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupportPage;
