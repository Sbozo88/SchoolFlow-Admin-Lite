"use client";

import { UserCheck, UserX, Clock, FileWarning, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import type { AttendanceFormValues, AttendanceRecord, AttendanceStatus } from "@/features/attendance/types";
import { useLearners } from "@/features/learners/hooks/useLearners";
import { Card } from "@/components/ui/Card";

export function AttendancePage() {
  const { records: attendance, createAttendance, updateAttendance, syncState } = useAttendance();
  const { records: learners } = useLearners();
  
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterProgramme, setFilterProgramme] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get active learners, filtered
  const activeLearners = useMemo(() => {
    return learners.filter(l => {
      const matchSearch = l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProgramme = filterProgramme ? l.programme === filterProgramme : true;
      return l.learnerStatus === "active" && matchSearch && matchProgramme;
    });
  }, [learners, searchQuery, filterProgramme]);

  // Extract unique programmes for the select dropdown
  const programmes = useMemo(() => Array.from(new Set(learners.map(l => l.programme).filter(Boolean))), [learners]);

  // Find attendance for a specific learner on the selected date
  const getLearnerAttendance = (learnerId: string) => {
    return attendance.find(a => a.learnerId === learnerId && a.date === filterDate);
  };

  const handleMarkAttendance = async (learnerId: string, status: AttendanceStatus) => {
    const existingRecord = getLearnerAttendance(learnerId);
    if (existingRecord) {
      if (existingRecord.status !== status) {
        await updateAttendance(existingRecord.id, { status });
      }
    } else {
      const learner = learners.find(l => l.id === learnerId);
      if (learner) {
        await createAttendance({
          learnerId: learner.id,
          learnerName: `${learner.firstName} ${learner.lastName}`,
          className: learner.className,
          programme: learner.programme,
          date: filterDate,
          status,
        });
      }
    }
  };

  // Summary stats for the current date
  const todaysAttendance = attendance.filter(a => a.date === filterDate);
  const totalMarked = todaysAttendance.length;
  const presentCount = todaysAttendance.filter(a => a.status === "present").length;
  const absentCount = todaysAttendance.filter(a => a.status === "absent").length;
  const lateCount = todaysAttendance.filter(a => a.status === "late").length;
  const excusedCount = todaysAttendance.filter(a => a.status === "excused").length;

  return (
    <>
      <PageHeader 
        description={`${syncState}. Digital Register - select a date and programme to mark attendance.`} 
        title="Attendance Register" 
      />
      
      {/* Attendance Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-slate-50 text-center">
          <p className="text-xs font-bold uppercase text-slate-500">Total Marked</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalMarked}</p>
        </Card>
        <Card className="p-4 bg-emerald-50 text-center">
          <p className="text-xs font-bold uppercase text-emerald-600">Present</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</p>
        </Card>
        <Card className="p-4 bg-rose-50 text-center">
          <p className="text-xs font-bold uppercase text-rose-600">Absent</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{absentCount}</p>
        </Card>
        <Card className="p-4 bg-amber-50 text-center">
          <p className="text-xs font-bold uppercase text-amber-600">Late</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{lateCount}</p>
        </Card>
        <Card className="p-4 bg-purple-50 text-center">
          <p className="text-xs font-bold uppercase text-purple-600">Excused</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{excusedCount}</p>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200">
        <Input 
          id="filterDate"
          label="Register Date"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <Select 
          id="filterProgramme"
          label="Programme"
          value={filterProgramme}
          onChange={(e) => setFilterProgramme(e.target.value)}
        >
          <option value="">All Programmes</option>
          {programmes.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Input 
          id="searchLearner"
          label="Search Learner"
          placeholder="Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {activeLearners.length > 0 ? (
        <div className="grid gap-3">
          {activeLearners.map(learner => {
            const record = getLearnerAttendance(learner.id);
            const status = record?.status;

            return (
              <div key={learner.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-100 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{learner.firstName} {learner.lastName}</h3>
                  <p className="text-sm text-slate-500">{learner.className} • {learner.programme}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleMarkAttendance(learner.id, "present")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition
                      ${status === "present" ? "bg-emerald-100 border-emerald-200 text-emerald-800 ring-2 ring-emerald-500" : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50"}`}
                  >
                    <UserCheck size={16} /> Present
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(learner.id, "absent")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition
                      ${status === "absent" ? "bg-rose-100 border-rose-200 text-rose-800 ring-2 ring-rose-500" : "bg-white border-slate-200 text-slate-600 hover:bg-rose-50"}`}
                  >
                    <UserX size={16} /> Absent
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(learner.id, "late")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition
                      ${status === "late" ? "bg-amber-100 border-amber-200 text-amber-800 ring-2 ring-amber-500" : "bg-white border-slate-200 text-slate-600 hover:bg-amber-50"}`}
                  >
                    <Clock size={16} /> Late
                  </button>
                  <button 
                    onClick={() => handleMarkAttendance(learner.id, "excused")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition
                      ${status === "excused" ? "bg-purple-100 border-purple-200 text-purple-800 ring-2 ring-purple-500" : "bg-white border-slate-200 text-slate-600 hover:bg-purple-50"}`}
                  >
                    <FileWarning size={16} /> Excused
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          action={<Search className="mx-auto text-teal-700" size={24} />}
          description="No learners match your filters."
          title="No learners found"
        />
      )}
    </>
  );
}

export default AttendancePage;
