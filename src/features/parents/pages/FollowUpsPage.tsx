"use client";

import { MessageSquareText, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useFollowUps } from "@/features/parents/hooks/useFollowUps";
import { WhatsAppTemplates, buildWhatsAppUrl } from "@/utils/whatsapp";

export function FollowUpsPage() {
  const { records: followUps, createFollowUp, updateFollowUp, deleteFollowUp } = useFollowUps();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    learnerName: "",
    parentName: "",
    parentPhone: "",
    reason: "general_update" as any,
    status: "pending" as any,
    message: "",
  });

  const handleCopy = (message: string) => {
    navigator.clipboard.writeText(message);
    alert("Message copied to clipboard!");
  };

  const handleGenerateMessage = () => {
    let msg = "";
    const { parentName, learnerName, reason } = formValues;
    switch (reason) {
      case "absence":
        msg = WhatsAppTemplates.absence(parentName, learnerName, "[Programme]", "[Date]");
        break;
      case "unpaid_fees":
        msg = WhatsAppTemplates.unpaid_fees(parentName, learnerName, 0, "[Month]");
        break;
      case "missing_info":
        msg = WhatsAppTemplates.missing_info(parentName, learnerName);
        break;
      case "reminder":
        msg = WhatsAppTemplates.payment_reminder(parentName, learnerName, "[Month]");
        break;
      default:
        msg = WhatsAppTemplates.general_update(parentName, learnerName, "[Update]");
        break;
    }
    setFormValues(prev => ({ ...prev, message: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await createFollowUp({
      learnerId: `temp-${Date.now()}`,
      ...formValues,
    });
    setIsSaving(false);
    setIsFormOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Follow-ups"
        description="Track communication tasks and generate WhatsApp messages for parents."
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> New Follow-up
          </Button>
        }
      />

      {followUps.length > 0 ? (
        <div className="grid gap-4 mt-6">
          {followUps.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-900 text-lg">{item.learnerName}</h3>
                  <Badge tone={item.status === "done" ? "green" : item.status === "urgent" ? "rose" : "amber"}>
                    {item.status}
                  </Badge>
                  <Badge tone="slate">{item.reason.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-slate-600">Parent: {item.parentName} ({item.parentPhone})</p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-800 relative group">
                  {item.message}
                  <button 
                    onClick={() => handleCopy(item.message)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-slate-500 rounded-md border border-slate-200 opacity-0 group-hover:opacity-100 transition hover:bg-slate-50 hover:text-slate-900"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-32">
                <Button 
                  variant={item.status === "done" ? "secondary" : "primary"}
                  onClick={() => updateFollowUp(item.id, { status: item.status === "done" ? "pending" : "done" })}
                >
                  {item.status === "done" ? "Undo" : "Mark Done"}
                </Button>
                <a 
                  href={buildWhatsAppUrl(item.parentPhone, item.message)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-9 px-3 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <MessageSquareText size={15} className="mr-2 text-teal-600" />
                  WhatsApp
                </a>
                <Button variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={() => deleteFollowUp(item.id)}>
                  <Trash2 size={15} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No follow-ups" description="You have no pending parent follow-ups." action={
          <Button onClick={() => setIsFormOpen(true)}><Plus size={16} /> New Follow-up</Button>
        } />
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Create Follow-up">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Learner Name" required value={formValues.learnerName} onChange={e => setFormValues(prev => ({...prev, learnerName: e.target.value}))} />
            <Select label="Reason" value={formValues.reason} onChange={e => setFormValues(prev => ({...prev, reason: e.target.value as any}))}>
              <option value="absence">Absence</option>
              <option value="unpaid_fees">Unpaid Fees</option>
              <option value="missing_info">Missing Info</option>
              <option value="reminder">Reminder</option>
              <option value="general_update">General Update</option>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Parent Name" required value={formValues.parentName} onChange={e => setFormValues(prev => ({...prev, parentName: e.target.value}))} />
            <Input label="Parent Phone" required value={formValues.parentPhone} onChange={e => setFormValues(prev => ({...prev, parentPhone: e.target.value}))} />
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-bold text-slate-700">Message</label>
              <Button type="button" variant="secondary" onClick={handleGenerateMessage} className="h-8 text-xs px-2">
                Generate Template
              </Button>
            </div>
            <textarea
              required
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              value={formValues.message}
              onChange={e => setFormValues(prev => ({...prev, message: e.target.value}))}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>Save Follow-up</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default FollowUpsPage;
