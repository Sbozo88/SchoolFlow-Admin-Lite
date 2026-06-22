import type { AttendanceRecord } from "@/types/attendance";
import type { Learner } from "@/types/learner";
import type { Payment } from "@/types/payment";

export const demoLearners: Learner[] = [
  {
    id: "learner-ava-mokoena",
    firstName: "Ava",
    lastName: "Mokoena",
    className: "Grade 3A",
    programme: "Junior Music",
    instrumentOrActivity: "Piano",
    parentName: "Naledi Mokoena",
    parentPhone: "0825550101",
    parentEmail: "naledi.mokoena@example.com",
    paymentStatus: "paid",
    notes: "Prefers Monday afternoon lessons.",
    createdAt: new Date("2026-05-01T08:00:00+02:00"),
    updatedAt: new Date("2026-05-24T10:30:00+02:00"),
  },
  {
    id: "learner-liam-naidoo",
    firstName: "Liam",
    lastName: "Naidoo",
    className: "Grade 4B",
    programme: "Contemporary Band",
    instrumentOrActivity: "Guitar",
    parentName: "Priya Naidoo",
    parentPhone: "0835550102",
    parentEmail: "priya.naidoo@example.com",
    paymentStatus: "partial",
    notes: "Needs invoice follow-up before month end.",
    createdAt: new Date("2026-05-03T09:15:00+02:00"),
    updatedAt: new Date("2026-05-25T12:00:00+02:00"),
  },
  {
    id: "learner-zara-dlamini",
    firstName: "Zara",
    lastName: "Dlamini",
    className: "Grade 2C",
    programme: "Dance Foundations",
    instrumentOrActivity: "Dance",
    parentName: "Thandi Dlamini",
    parentPhone: "0845550103",
    parentEmail: "thandi.dlamini@example.com",
    paymentStatus: "unpaid",
    notes: "Trial learner awaiting placement confirmation.",
    createdAt: new Date("2026-05-08T14:00:00+02:00"),
    updatedAt: new Date("2026-05-26T09:45:00+02:00"),
  },
  {
    id: "learner-ethan-jacobs",
    firstName: "Ethan",
    lastName: "Jacobs",
    className: "Grade 5A",
    programme: "Performance Prep",
    instrumentOrActivity: "Drums",
    parentName: "Megan Jacobs",
    parentPhone: "0715550104",
    parentEmail: "megan.jacobs@example.com",
    paymentStatus: "overdue",
    notes: "Do not schedule extra sessions until payment is resolved.",
    createdAt: new Date("2026-04-20T11:30:00+02:00"),
    updatedAt: new Date("2026-05-27T16:20:00+02:00"),
  },
];

export const demoAttendance: AttendanceRecord[] = [
  {
    id: "attendance-ava-2026-05-25",
    learnerId: "learner-ava-mokoena",
    learnerName: "Ava Mokoena",
    lessonDate: new Date("2026-05-25T14:30:00+02:00"),
    status: "present",
  },
  {
    id: "attendance-liam-2026-05-25",
    learnerId: "learner-liam-naidoo",
    learnerName: "Liam Naidoo",
    lessonDate: new Date("2026-05-25T15:15:00+02:00"),
    status: "late",
    notes: "Arrived 10 minutes late.",
  },
  {
    id: "attendance-zara-2026-05-26",
    learnerId: "learner-zara-dlamini",
    learnerName: "Zara Dlamini",
    lessonDate: new Date("2026-05-26T13:45:00+02:00"),
    status: "excused",
    notes: "Parent notified school event clash.",
  },
  {
    id: "attendance-ethan-2026-05-27",
    learnerId: "learner-ethan-jacobs",
    learnerName: "Ethan Jacobs",
    lessonDate: new Date("2026-05-27T16:00:00+02:00"),
    status: "absent",
    notes: "Follow up required.",
  },
];

export const demoPayments: Payment[] = [
  {
    id: "payment-ava-2026-05",
    learnerId: "learner-ava-mokoena",
    learnerName: "Ava Mokoena",
    parentName: "Naledi Mokoena",
    amount: 750,
    dueDate: new Date("2026-05-10T00:00:00+02:00"),
    status: "paid",
    paidAt: new Date("2026-05-08T09:30:00+02:00"),
  },
  {
    id: "payment-liam-2026-05",
    learnerId: "learner-liam-naidoo",
    learnerName: "Liam Naidoo",
    parentName: "Priya Naidoo",
    amount: 850,
    dueDate: new Date("2026-05-10T00:00:00+02:00"),
    status: "sent",
  },
  {
    id: "payment-zara-2026-05",
    learnerId: "learner-zara-dlamini",
    learnerName: "Zara Dlamini",
    parentName: "Thandi Dlamini",
    amount: 650,
    dueDate: new Date("2026-05-31T00:00:00+02:00"),
    status: "draft",
  },
  {
    id: "payment-ethan-2026-05",
    learnerId: "learner-ethan-jacobs",
    learnerName: "Ethan Jacobs",
    parentName: "Megan Jacobs",
    amount: 900,
    dueDate: new Date("2026-05-10T00:00:00+02:00"),
    status: "overdue",
  },
];

export const emptyLearners = demoLearners;
export const emptyAttendance = demoAttendance;
export const emptyPayments = demoPayments;

export const demoData = {
  learners: demoLearners,
  attendance: demoAttendance,
  payments: demoPayments,
};
