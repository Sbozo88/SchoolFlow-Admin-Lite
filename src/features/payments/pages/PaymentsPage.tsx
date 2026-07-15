"use client";

import { CreditCard, Plus, Pencil, Trash2, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { usePayments } from "@/features/payments/hooks/usePayments";
import type { PaymentFormValues, PaymentRecord, PaymentStatus } from "@/features/payments/types";
import { useLearners } from "@/features/learners/hooks/useLearners";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/utils/format";
import { WhatsAppTemplates, buildWhatsAppUrl } from "@/utils/whatsapp";

export function PaymentsPage() {
  const { records: payments, createPayment, updatePayment, deletePayment, syncState } = usePayments();
  const { records: learners } = useLearners();
  
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  
  const [formValues, setFormValues] = useState({
    learnerId: "",
    month: new Date().toISOString().slice(0, 7),
    expectedAmount: 0,
    paidAmount: 0,
    status: "unpaid" as PaymentStatus,
    paymentDate: "",
    notes: "",
  });

  const filteredPayments = payments.filter(record => {
    const matchMonth = filterMonth ? record.month === filterMonth : true;
    const matchStatus = filterStatus !== "all" ? record.status === filterStatus : true;
    return matchMonth && matchStatus;
  });

  const generateWhatsAppUrl = (record: PaymentRecord) => {
    const learner = learners.find(l => l.id === record.learnerId);
    if (!learner) return "#";
    
    let msg = "";
    if (record.status === "unpaid" || record.status === "overdue") {
      msg = WhatsAppTemplates.unpaid_fees(learner.parentName, learner.firstName, record.balance, record.month);
    } else if (record.status === "partial") {
      msg = WhatsAppTemplates.payment_reminder(learner.parentName, learner.firstName, record.month);
    } else {
      msg = WhatsAppTemplates.general_update(learner.parentName, learner.firstName, "Thank you for your payment.");
    }

    return buildWhatsAppUrl(learner.parentPhone, msg);
  };

  const columns: TableColumn<PaymentRecord>[] = [
    { key: "learner", header: "Learner", render: (record) => <span className="font-bold text-slate-950">{record.learnerName}</span> },
    { key: "month", header: "Month", render: (record) => record.month },
    { key: "expected", header: "Expected", render: (record) => formatCurrency(record.expectedAmount) },
    { key: "paid", header: "Paid", render: (record) => formatCurrency(record.paidAmount) },
    { 
      key: "balance", 
      header: "Balance", 
      render: (record) => (
        <span className={record.balance > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
          {formatCurrency(record.balance)}
        </span>
      ) 
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <Badge tone={record.status === "paid" ? "green" : record.status === "overdue" ? "rose" : "amber"}>{record.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (record) => (
        <div className="flex gap-2">
          {record.status !== "paid" && (
            <a 
              href={generateWhatsAppUrl(record)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-bold hover:bg-teal-100"
              title="Send WhatsApp Reminder"
            >
              <MessageSquareText size={14} /> Reminder
            </a>
          )}
          <Button variant="secondary" className="px-2 h-7" onClick={() => openEdit(record)}><Pencil size={14} /></Button>
          <Button variant="ghost" className="text-rose-600 px-2 h-7" onClick={() => deletePayment(record.id)}><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  function openCreate() {
    setSelectedRecord(null);
    setFormValues({
      learnerId: "",
      month: filterMonth || new Date().toISOString().slice(0, 7),
      expectedAmount: 0,
      paidAmount: 0,
      status: "unpaid",
      paymentDate: "",
      notes: "",
    });
    setIsFormOpen(true);
  }

  function openEdit(record: PaymentRecord) {
    setSelectedRecord(record);
    setFormValues({
      learnerId: record.learnerId,
      month: record.month,
      expectedAmount: record.expectedAmount,
      paidAmount: record.paidAmount,
      status: record.status,
      paymentDate: record.paymentDate || "",
      notes: record.notes || "",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const learner = learners.find(l => l.id === formValues.learnerId);
    if (!learner) return;

    const balance = formValues.expectedAmount - formValues.paidAmount;

    const payload = {
      learnerId: learner.id,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      month: formValues.month,
      expectedAmount: Number(formValues.expectedAmount),
      paidAmount: Number(formValues.paidAmount),
      balance,
      status: formValues.status,
      paymentDate: formValues.paymentDate || undefined,
      notes: formValues.notes || undefined,
    };

    if (selectedRecord) {
      await updatePayment(selectedRecord.id, payload);
    } else {
      await createPayment(payload as Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">);
    }
    
    setIsSaving(false);
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader 
        description={`${syncState}. Answer "Who still needs to pay?" and send WhatsApp reminders.`} 
        title="Payment Tracking" 
        action={<Button onClick={openCreate}><Plus size={16} /> Record Payment</Button>}
      />
      
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200 items-end">
        <Input 
          id="filterMonth"
          label="Filter by Month"
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
        <Select 
          id="filterStatus"
          label="Filter by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      {filteredPayments.length > 0 ? (
        <Table columns={columns} getRowKey={(record) => record.id} rows={filteredPayments} />
      ) : (
        <EmptyState
          action={<CreditCard className="mx-auto text-teal-700" size={24} />}
          description="No payment records match your filters."
          title="No records found"
        />
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedRecord ? "Edit Record" : "Add Record"}>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Select 
            label="Learner" 
            value={formValues.learnerId} 
            onChange={e => setFormValues(prev => ({...prev, learnerId: e.target.value}))}
            required
            disabled={!!selectedRecord}
          >
            <option value="">Select a learner...</option>
            {learners.map(l => (
              <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Month" 
              type="month" 
              value={formValues.month} 
              onChange={e => setFormValues(prev => ({...prev, month: e.target.value}))}
              required 
            />
            <Select 
              label="Status" 
              value={formValues.status} 
              onChange={e => setFormValues(prev => ({...prev, status: e.target.value as PaymentStatus}))}
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Expected Amount" 
              type="number" 
              value={formValues.expectedAmount} 
              onChange={e => setFormValues(prev => ({...prev, expectedAmount: Number(e.target.value)}))}
              required 
            />
            <Input 
              label="Paid Amount" 
              type="number" 
              value={formValues.paidAmount} 
              onChange={e => setFormValues(prev => ({...prev, paidAmount: Number(e.target.value)}))}
              required 
            />
          </div>
          <Input 
            label="Date Paid" 
            type="date" 
            value={formValues.paymentDate} 
            onChange={e => setFormValues(prev => ({...prev, paymentDate: e.target.value}))} 
          />
          <Input 
            label="Notes" 
            value={formValues.notes} 
            onChange={e => setFormValues(prev => ({...prev, notes: e.target.value}))} 
          />
          <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>Save</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default PaymentsPage;
