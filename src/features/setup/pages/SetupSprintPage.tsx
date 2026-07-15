"use client";

import { CheckSquare, Copy, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSetupSprintTasks } from "@/hooks/useSetupSprintTasks";
import { useMissingInfoItems } from "@/hooks/useMissingInfoItems";

export function SetupSprintPage() {
  const { records: tasks, updateSetupSprintTaskStatus } = useSetupSprintTasks();
  const { records: missingInfo, updateMissingInfoStatus } = useMissingInfoItems();

  const totalTasks = tasks.length || 1; // avoid div/0
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);
  const openMissingInfo = missingInfo.filter(m => m.status === "open" || m.status === "requested").length;
  
  const setupStatus = progressPercent === 100 && openMissingInfo === 0 ? "Complete" : "In Progress";
  
  const nextAction = tasks.find(t => t.status === "not_started" || t.status === "in_progress")?.title || "Generate Handover Report";

  function handleCopyReport() {
    const report = `
*SchoolFlow Admin Lite - Setup Sprint Handover*
Status: ${setupStatus}
Progress: ${progressPercent}% (${completedTasks}/${totalTasks} tasks completed)
Missing Info Remaining: ${openMissingInfo} items

*Next Steps for Admin:*
- Review attendance tracking
- Review payment tracking
- Follow up on missing information

Thank you for completing the SchoolFlow Admin Lite Setup Sprint!
    `.trim();

    navigator.clipboard.writeText(report);
    alert("Handover report copied to clipboard!");
  }

  return (
    <>
      <PageHeader
        title="Setup Sprint"
        description="7-day done-for-you admin cleanup service. Track progress and missing information."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Progress</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">{progressPercent}%</h3>
            <Badge tone={progressPercent === 100 ? "green" : "teal"}>{setupStatus}</Badge>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Tasks Completed</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{completedTasks} / {totalTasks}</h3>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Missing Info</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">{openMissingInfo}</h3>
            <span className="text-sm text-slate-500">items</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Next Action</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 capitalize truncate">{nextAction}</h3>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Tasks Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckSquare size={20} className="text-teal-600" />
            7-Day Cleanup Checklist
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
            {tasks.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <p className="font-bold text-slate-900">Day {task.day}: {task.title}</p>
                  <p className="text-sm text-slate-500 mt-1 capitalize">Status: {task.status.replace("_", " ")}</p>
                </div>
                <Button 
                  variant={task.status === "done" ? "secondary" : "primary"}
                  onClick={() => updateSetupSprintTaskStatus(task.id, task.status === "done" ? "not_started" : "done")}
                >
                  {task.status === "done" ? "Undo" : "Mark Done"}
                </Button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-8 text-center text-slate-500">No tasks found.</div>
            )}
          </div>
        </div>

        {/* Missing Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Missing Information Tracker
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
            {missingInfo.map(info => (
              <div key={info.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <p className="font-bold text-slate-900">{info.learnerName || "General"}</p>
                  <p className="text-sm text-slate-600 mt-1">{info.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge tone={info.status === "resolved" ? "green" : "amber"}>{info.status}</Badge>
                    <Badge tone="slate">{info.category.replace("_", " ")}</Badge>
                  </div>
                </div>
                <Button 
                  variant={info.status === "resolved" ? "secondary" : "primary"}
                  onClick={() => updateMissingInfoStatus(info.id, info.status === "resolved" ? "open" : "resolved")}
                >
                  {info.status === "resolved" ? "Reopen" : "Resolve"}
                </Button>
              </div>
            ))}
            {missingInfo.length === 0 && (
              <div className="p-8 text-center text-slate-500">No missing info logged.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 text-white rounded-lg p-6 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Handover Report</h2>
          <p className="text-slate-300 mt-1">Generate a copy-paste ready summary to send to the client upon completion.</p>
        </div>
        <Button onClick={handleCopyReport} variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
          <Copy size={16} className="mr-2" />
          Copy Report
        </Button>
      </div>
    </>
  );
}

export default SetupSprintPage;
