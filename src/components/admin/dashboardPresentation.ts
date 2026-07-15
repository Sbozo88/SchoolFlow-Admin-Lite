/**
 * School-client dashboard presentation constants (labels + hrefs).
 * Kept as shipped source so structural UI tests drive real values, not a reimplementation.
 */
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CheckSquare,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  PhoneForwarded,
  Plus,
  Settings,
  Users,
} from "lucide-react";

export type SchoolNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const SCHOOL_PRIMARY_NAV: SchoolNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Learners", href: "/admin/learners", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Parent Follow-Ups", href: "/admin/parent-follow-ups", icon: PhoneForwarded },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Parent Form", href: "/admin/parent-form", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const SCHOOL_SUPPORT_NAV: SchoolNavItem[] = [
  { label: "Setup Sprint", href: "/admin/setup-sprint", icon: Activity },
  { label: "Handover", href: "/admin/handover", icon: FileText },
  { label: "Monthly Support", href: "/admin/monthly-support", icon: LifeBuoy },
];

export const SCHOOL_KPI_LABELS = [
  "Total Learners",
  "Present Today",
  "Absent Today",
  "Payments Pending",
  "Follow-Ups",
  "New Forms",
] as const;

export type SchoolQuickAction = {
  label: string;
  href: string;
  gradient: string;
  shadow: string;
  icon: LucideIcon;
};

/** Primary quick actions shown on the dashboard (same destinations as before). */
export const SCHOOL_QUICK_ACTIONS: SchoolQuickAction[] = [
  {
    label: "Add Learner",
    icon: Plus,
    href: "/admin/learners",
    gradient: "from-[#6c5ce7] to-[#a29bfe]",
    shadow: "shadow-[0_4px_15px_rgba(108,92,231,0.3)]",
  },
  {
    label: "Mark Attendance",
    icon: CheckSquare,
    href: "/admin/attendance",
    gradient: "from-[#00d2d3] to-[#01a3a4]",
    shadow: "shadow-[0_4px_15px_rgba(0,210,211,0.3)]",
  },
  {
    label: "Record Payment",
    icon: CreditCard,
    href: "/admin/payments",
    gradient: "from-[#feca57] to-[#f0932b]",
    shadow: "shadow-[0_4px_15px_rgba(254,202,87,0.3)]",
  },
  {
    label: "Create Follow-Up",
    icon: PhoneForwarded,
    href: "/admin/parent-follow-ups",
    gradient: "from-[#ff6b81] to-[#ee5a24]",
    shadow: "shadow-[0_4px_15px_rgba(255,107,129,0.3)]",
  },
  {
    label: "Generate Report",
    icon: FileText,
    href: "/admin/reports",
    gradient: "from-[#1dd1a1] to-[#10ac84]",
    shadow: "shadow-[0_4px_15px_rgba(29,209,161,0.3)]",
  },
  {
    label: "Review Forms",
    icon: ClipboardList,
    href: "/admin/parent-form",
    gradient: "from-[#a29bfe] to-[#6c5ce7]",
    shadow: "shadow-[0_4px_15px_rgba(162,155,254,0.3)]",
  },
];

export const SCHOOL_UPCOMING_EVENTS = [
  { name: "Staff Meeting", time: "Tomorrow, 9:00 AM", color: "bg-[#6c5ce7]" },
  { name: "Parent-Teacher Day", time: "Jul 8, 2:00 PM", color: "bg-[#ff6b81]" },
  { name: "Term Exams Begin", time: "Jul 15, 8:00 AM", color: "bg-[#feca57]" },
] as const;

export function schoolPrimaryNavLabels(): string[] {
  return SCHOOL_PRIMARY_NAV.map((item) => item.label);
}

export function schoolSupportNavLabels(): string[] {
  return SCHOOL_SUPPORT_NAV.map((item) => item.label);
}

export function schoolQuickActionHrefs(): string[] {
  return SCHOOL_QUICK_ACTIONS.map((item) => item.href);
}
