"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Learner = {
  id: string;
  name: string;
  class: string;
  parent: string;
  phone: string;
  status: "Active" | "Archived";
};

export type Attendance = {
  id: string; // matches learner.id
  name: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent" | "Late" | "None";
};

export type Payment = {
  id: string;
  learnerId: string;
  learnerName: string;
  amount: number;
  date: string;
  method: string;
  status: "Completed" | "Pending";
};

export type FollowUp = {
  id: string;
  parent: string;
  learner: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Resolved";
  date: string;
};

export type ParentForm = {
  id: string;
  parentName: string;
  learnerName: string;
  type: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
  phone?: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: "Open" | "Resolved";
  date: string;
  priority: "High" | "Medium" | "Low";
};

export type HandoverTask = {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "Done";
  term: string;
};

type MockDataContextType = {
  learners: Learner[];
  addLearner: (learner: Learner) => void;
  updateLearner: (id: string, learner: Partial<Learner>) => void;

  attendance: Attendance[];
  markAttendance: (id: string, date: string, status: Attendance["status"], name: string) => void;

  payments: Payment[];
  recordPayment: (payment: Payment) => void;

  followUps: FollowUp[];
  addFollowUp: (followUp: FollowUp) => void;
  updateFollowUpStatus: (id: string, status: FollowUp["status"]) => void;

  forms: ParentForm[];
  updateFormStatus: (id: string, status: ParentForm["status"]) => void;

  tickets: SupportTicket[];
  addTicket: (ticket: SupportTicket) => void;
  resolveTicket: (id: string) => void;

  handovers: HandoverTask[];
  toggleHandoverTask: (id: string) => void;
  addHandoverTask: (task: HandoverTask) => void;
};

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

const initialLearners: Learner[] = [
  { id: "L001", name: "Lucas Brown", class: "Grade 4 Music", parent: "Jane Brown", phone: "555-0101", status: "Active" },
  { id: "L002", name: "Emma Smith", class: "Grade 5 Art", parent: "Michael Smith", phone: "555-0102", status: "Active" },
  { id: "L003", name: "Oliver Jones", class: "Grade 4 Music", parent: "Sarah Jones", phone: "555-0103", status: "Archived" },
  { id: "L004", name: "Sophia Davis", class: "Grade 6 Drama", parent: "David Davis", phone: "555-0104", status: "Active" },
  { id: "L005", name: "Mia Wilson", class: "Grade 4 Music", parent: "Chloe Wilson", phone: "555-0105", status: "Active" },
  { id: "L006", name: "Ethan Taylor", class: "Grade 5 Art", parent: "James Taylor", phone: "555-0106", status: "Active" },
  { id: "L007", name: "Ava Thomas", class: "Grade 6 Drama", parent: "Linda Thomas", phone: "555-0107", status: "Active" },
  { id: "L008", name: "Noah White", class: "Grade 4 Music", parent: "Robert White", phone: "555-0108", status: "Active" },
];

const initialPayments: Payment[] = [
  { id: "P001", learnerId: "L001", learnerName: "Lucas Brown", amount: 150, date: "2026-06-24", method: "Credit Card", status: "Completed" },
  { id: "P002", learnerId: "L002", learnerName: "Emma Smith", amount: 200, date: "2026-06-22", method: "Bank Transfer", status: "Completed" },
  { id: "P003", learnerId: "L004", learnerName: "Sophia Davis", amount: 150, date: "2026-06-20", method: "Cash", status: "Pending" },
  { id: "P004", learnerId: "L006", learnerName: "Ethan Taylor", amount: 150, date: "2026-06-15", method: "Credit Card", status: "Completed" },
];

const initialFollowUps: FollowUp[] = [
  { id: "F001", parent: "Jane Brown", learner: "Lucas Brown", reason: "Unpaid fees for June", priority: "High", status: "Pending", date: "2026-06-23" },
  { id: "F002", parent: "Michael Smith", learner: "Emma Smith", reason: "Missed 3 classes", priority: "Medium", status: "Pending", date: "2026-06-21" },
  { id: "F003", parent: "Sarah Jones", learner: "Oliver Jones", reason: "Request for progress report", priority: "Low", status: "Resolved", date: "2026-06-18" },
];

const initialForms: ParentForm[] = [
  { id: "FM001", parentName: "Jane Doe", learnerName: "John Doe", type: "Leave Application", date: "2026-06-23", status: "Pending" },
  { id: "FM002", parentName: "Robert White", learnerName: "Noah White", type: "Medical Info Update", date: "2026-06-22", status: "Approved" },
  { id: "FM003", parentName: "Linda Thomas", learnerName: "Ava Thomas", type: "Field Trip Consent", date: "2026-06-20", status: "Approved" },
];

const initialTickets: SupportTicket[] = [
  { id: "T001", subject: "Cannot export attendance report", description: "When I click export, it downloads an empty file.", status: "Open", priority: "High", date: "2026-06-24" },
  { id: "T002", subject: "Feature Request: Custom fields", description: "We need custom fields for parent profiles.", status: "Open", priority: "Medium", date: "2026-06-22" },
  { id: "T003", subject: "Login issues for teacher", description: "Mrs. Smith cannot log in.", status: "Resolved", priority: "High", date: "2026-06-20" },
];

const initialHandovers: HandoverTask[] = [
  { id: "H001", title: "Archive Term 2 Data", description: "Archive all attendance and grades for Term 2.", status: "Pending", term: "Term 2" },
  { id: "H002", title: "Generate Report Cards", description: "Finalize and distribute report cards.", status: "Pending", term: "Term 2" },
  { id: "H003", title: "Update Fee Structures", description: "Set new fees for the upcoming term.", status: "Done", term: "Term 2" },
  { id: "H004", title: "Clear Term 1 Arrears", description: "Follow up on all term 1 unpaid balances.", status: "Done", term: "Term 1" },
];

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps);
  const [forms, setForms] = useState<ParentForm[]>(initialForms);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [handovers, setHandovers] = useState<HandoverTask[]>(initialHandovers);

  const addLearner = (learner: Learner) => setLearners([...learners, learner]);
  const updateLearner = (id: string, learner: Partial<Learner>) => 
    setLearners(learners.map(l => l.id === id ? { ...l, ...learner } : l));

  const markAttendance = (id: string, date: string, status: Attendance["status"], name: string) => {
    setAttendance(prev => {
      const existing = prev.findIndex(a => a.id === id && a.date === date);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], status };
        return next;
      }
      return [...prev, { id, name, date, status }];
    });
  };

  const recordPayment = (payment: Payment) => setPayments([payment, ...payments]);

  const addFollowUp = (followUp: FollowUp) => setFollowUps([followUp, ...followUps]);
  
  const updateFollowUpStatus = (id: string, status: FollowUp["status"]) =>
    setFollowUps(followUps.map(f => f.id === id ? { ...f, status } : f));

  const updateFormStatus = (id: string, status: ParentForm["status"]) =>
    setForms(forms.map(f => f.id === id ? { ...f, status } : f));

  const addTicket = (ticket: SupportTicket) => setTickets([ticket, ...tickets]);
  const resolveTicket = (id: string) => 
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "Resolved" } : t));

  const toggleHandoverTask = (id: string) => 
    setHandovers(handovers.map(h => h.id === id ? { ...h, status: h.status === "Pending" ? "Done" : "Pending" } : h));
  
  const addHandoverTask = (task: HandoverTask) => setHandovers([task, ...handovers]);

  return (
    <MockDataContext.Provider value={{
      learners, addLearner, updateLearner,
      attendance, markAttendance,
      payments, recordPayment,
      followUps, addFollowUp, updateFollowUpStatus,
      forms, updateFormStatus,
      tickets, addTicket, resolveTicket,
      handovers, toggleHandoverTask, addHandoverTask
    }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
}
