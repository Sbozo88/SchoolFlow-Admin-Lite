"use client";

import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useLearners } from "@/hooks/useLearners";
import type { Learner, LearnerFormValues } from "@/types/learner";
import { fullName } from "@/utils/format";

const emptyFormValues: LearnerFormValues = {
  firstName: "",
  lastName: "",
  className: "",
  programme: "",
  instrumentOrActivity: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  paymentStatus: "unpaid",
  notes: "",
};

function toFormValues(learner: Learner): LearnerFormValues {
  return {
    firstName: learner.firstName,
    lastName: learner.lastName,
    className: learner.className,
    programme: learner.programme,
    instrumentOrActivity: learner.instrumentOrActivity,
    parentName: learner.parentName,
    parentPhone: learner.parentPhone,
    parentEmail: learner.parentEmail ?? "",
    paymentStatus: learner.paymentStatus,
    notes: learner.notes ?? "",
  };
}

export function LearnersPage() {
  const {
    records: learners,
    syncState,
    errorMessage,
    isConfigured,
    createLearner,
    updateLearner,
    deleteLearner,
  } = useLearners();
  const [formValues, setFormValues] = useState<LearnerFormValues>(emptyFormValues);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const columns: TableColumn<Learner>[] = [
    {
      key: "learner",
      header: "Learner",
      render: (learner) => <span className="font-bold text-slate-950">{fullName(learner.firstName, learner.lastName)}</span>,
    },
    { key: "parent", header: "Parent", render: (learner) => learner.parentName },
    { key: "phone", header: "Phone", render: (learner) => learner.parentPhone },
    { key: "class", header: "Class", render: (learner) => learner.className },
    { key: "programme", header: "Programme", render: (learner) => learner.programme },
    { key: "activity", header: "Activity", render: (learner) => learner.instrumentOrActivity },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (learner) => (
        <Badge tone={learner.paymentStatus === "paid" ? "green" : learner.paymentStatus === "overdue" ? "rose" : "amber"}>
          {learner.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (learner) => (
        <div className="flex items-center gap-2">
          <Button className="h-9 px-3" onClick={() => openEditForm(learner)} type="button" variant="secondary">
            <Pencil size={15} />
            Edit
          </Button>
          <Button className="h-9 px-3 text-rose-700 hover:text-rose-800" onClick={() => handleDeleteLearner(learner)} type="button" variant="ghost">
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  function openCreateForm() {
    setSelectedLearner(null);
    setFormValues(emptyFormValues);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(learner: Learner) {
    setSelectedLearner(learner);
    setFormValues(toFormValues(learner));
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setSelectedLearner(null);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setDeleteError("");

    if (
      !formValues.firstName.trim() ||
      !formValues.lastName.trim() ||
      !formValues.className.trim() ||
      !formValues.programme.trim() ||
      !formValues.instrumentOrActivity.trim() ||
      !formValues.parentName.trim() ||
      !formValues.parentPhone.trim()
    ) {
      setFormError("Learner, class, programme, activity, parent name, and parent phone are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedLearner) {
        await updateLearner(selectedLearner.id, formValues);
      } else {
        await createLearner(formValues);
      }
      closeForm();
    } catch {
      setFormError("Learner could not be saved. Check Firebase access and admin permissions.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteLearner(learner: Learner) {
    setDeleteError("");
    const confirmed = window.confirm(`Delete ${fullName(learner.firstName, learner.lastName)}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteLearner(learner.id);
    } catch {
      setDeleteError("Learner could not be deleted. Check Firebase access and admin permissions.");
    }
  }

  return (
    <ProtectedRoute>
      <AdminLayout activeItem="Learners">
        <PageHeader
          action={
            <Button disabled={!isConfigured} onClick={openCreateForm} type="button">
              <UserPlus size={16} />
              Add learner
            </Button>
          }
          description={`${syncState}. Manage learner records from the Firestore learners collection.`}
          title="Learners"
        />
        {errorMessage ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
        {deleteError ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{deleteError}</p> : null}
        {learners.length > 0 ? (
          <Table columns={columns} getRowKey={(learner) => learner.id} rows={learners} />
        ) : (
          <EmptyState
            action={
              <Button disabled={!isConfigured} onClick={openCreateForm} type="button">
                <UserPlus size={16} />
                Add learner
              </Button>
            }
            description="No learner records are available from Firestore yet."
            title="No learners found"
          />
        )}
        <Modal isOpen={isFormOpen} onClose={closeForm} title={selectedLearner ? "Edit learner" : "Add learner"}>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="firstName"
                label="First name"
                onChange={(event) => setFormValues((current) => ({ ...current, firstName: event.target.value }))}
                required
                value={formValues.firstName}
              />
              <Input
                id="lastName"
                label="Last name"
                onChange={(event) => setFormValues((current) => ({ ...current, lastName: event.target.value }))}
                required
                value={formValues.lastName}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="className"
                label="Class"
                onChange={(event) => setFormValues((current) => ({ ...current, className: event.target.value }))}
                required
                value={formValues.className}
              />
              <Input
                id="programme"
                label="Programme"
                onChange={(event) => setFormValues((current) => ({ ...current, programme: event.target.value }))}
                required
                value={formValues.programme}
              />
              <Input
                id="instrumentOrActivity"
                label="Instrument/activity"
                onChange={(event) => setFormValues((current) => ({ ...current, instrumentOrActivity: event.target.value }))}
                required
                value={formValues.instrumentOrActivity}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="parentName"
                label="Parent name"
                onChange={(event) => setFormValues((current) => ({ ...current, parentName: event.target.value }))}
                required
                value={formValues.parentName}
              />
              <Input
                id="parentPhone"
                label="Parent phone"
                onChange={(event) => setFormValues((current) => ({ ...current, parentPhone: event.target.value }))}
                required
                value={formValues.parentPhone}
              />
            </div>
            <Input
              id="parentEmail"
              label="Parent email"
              onChange={(event) => setFormValues((current) => ({ ...current, parentEmail: event.target.value }))}
              type="email"
              value={formValues.parentEmail}
            />
            <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
              <Select
                id="paymentStatus"
                label="Payment status"
                onChange={(event) => setFormValues((current) => ({ ...current, paymentStatus: event.target.value as LearnerFormValues["paymentStatus"] }))}
                value={formValues.paymentStatus}
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Select>
              <label className="grid gap-2 text-sm font-bold text-slate-700" htmlFor="notes">
                <span>Notes</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  id="notes"
                  onChange={(event) => setFormValues((current) => ({ ...current, notes: event.target.value }))}
                  value={formValues.notes}
                />
              </label>
            </div>
            {formError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p> : null}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <Button disabled={isSaving} onClick={closeForm} type="button" variant="secondary">
                Cancel
              </Button>
              <Button disabled={isSaving || !isConfigured} type="submit">
                {isSaving ? "Saving..." : selectedLearner ? "Save changes" : "Create learner"}
              </Button>
            </div>
          </form>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default LearnersPage;
