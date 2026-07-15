"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useHandoverTasks } from "@/hooks/useHandoverTasks";
import { FileText, Download, CheckCircle, Clock, CheckCircle2, ChevronRight, FolderLock, Check } from "lucide-react";

export default function HandoverPage() {
  const { records: handovers, toggleHandoverTask } = useHandoverTasks();
  const [selectedTerm, setSelectedTerm] = useState("Term 2");

  const terms = ["Term 1", "Term 2", "Term 3", "Term 4"];
  const currentTasks = handovers.filter(h => h.term === selectedTerm);
  const doneTasks = currentTasks.filter(h => h.status === "Done").length;
  const totalTasks = currentTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Handover & Transitions"
          description="Manage end-of-term checklists and generate compliance reports."
        />
        <Button variant="primary" className="bg-[#6c5ce7] hover:bg-[#5a4bcf]">
          <FolderLock className="mr-2" size={18} /> Close Academic Term
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {terms.map(term => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              selectedTerm === term 
                ? "bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/30" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {term} Handover
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-[#6c5ce7]" size={20} />
                {selectedTerm} Checklist
              </h3>
              <Badge tone={progress === 100 ? "green" : "amber"}>
                {doneTasks} of {totalTasks} Completed
              </Badge>
            </div>
            
            <div className="divide-y divide-slate-100">
              {currentTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  No handover tasks found for {selectedTerm}.
                </div>
              ) : (
                currentTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${task.status === "Done" ? "opacity-75" : ""}`}
                    onClick={() => toggleHandoverTask(task.id)}
                  >
                    <button className={`mt-0.5 flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === "Done" ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent"
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </button>
                    
                    <div className="flex-1">
                      <p className={`font-bold text-[15px] ${task.status === "Done" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-t-4 border-t-[#00cec9]">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Handover Status</h3>
            
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-600">Readiness</span>
              <span className="text-[#00cec9]">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-[#00cec9] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {progress === 100 ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <CheckCircle className="shrink-0 mt-0.5" size={16} />
                <p>All required tasks are completed. You are ready to generate the final handover report.</p>
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <Clock className="shrink-0 mt-0.5" size={16} />
                <p>Please complete all checklist items before generating the final term report.</p>
              </div>
            )}
            
            <Button 
              variant="secondary" 
              className="w-full mt-6 flex justify-between items-center bg-white border-2 hover:bg-slate-50"
              disabled={progress < 100}
            >
              <span className="flex items-center gap-2 font-bold text-slate-700">
                <FileText size={18} /> Generate PDF Report
              </span>
              <Download size={18} className="text-slate-400" />
            </Button>
          </Card>

          <Card className="p-0 overflow-hidden">
             <div className="bg-slate-900 p-5 text-white">
               <h4 className="font-bold flex items-center gap-2">
                 <Clock size={16} className="text-slate-400" /> Recent Archives
               </h4>
             </div>
             <div className="divide-y divide-slate-100">
               <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Term 1 Final Handover</p>
                   <p className="text-xs text-slate-500 mt-1">Generated: Mar 30, 2026</p>
                 </div>
                 <ChevronRight className="text-slate-400" size={18} />
               </button>
               <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                 <div>
                   <p className="font-bold text-slate-800 text-sm">2025 Year-End Report</p>
                   <p className="text-xs text-slate-500 mt-1">Generated: Dec 15, 2025</p>
                 </div>
                 <ChevronRight className="text-slate-400" size={18} />
               </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
