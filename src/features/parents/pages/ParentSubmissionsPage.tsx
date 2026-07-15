"use client";

import { Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useParentSubmissions } from "@/features/parents/hooks/useParentSubmissions";
import type { ParentSubmissionRecord } from "@/features/parents/types";
import { useLearners } from "@/features/learners/hooks/useLearners";

export function ParentSubmissionsPage() {
  const {
    records: submissions,
    syncState,
    errorMessage,
    isConfigured,
    updateSubmissionStatus,
  } = useParentSubmissions();

  const { createLearner } = useLearners();

  const [filter, setFilter] = useState("all");
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  async function handleMarkReviewed(submission: ParentSubmissionRecord) {
    try {
      setActionError("");
      await updateSubmissionStatus(submission.id, "reviewed");
    } catch {
      setActionError("Failed to update status. Check permissions.");
    }
  }

  async function handleConvertToLearner(submission: ParentSubmissionRecord) {
    try {
      setActionError("");
      setIsConverting(submission.id);
      
      // Create Learner
      await createLearner({
        firstName: submission.learnerFirstName,
        lastName: submission.learnerLastName,
        className: submission.className,
        programme: submission.programme,
        instrumentOrActivity: submission.instrumentOrActivity || "None",
        parentName: submission.parentName,
        parentPhone: submission.parentPhone,
        parentEmail: submission.parentEmail || "",
        paymentStatus: "unpaid",
        learnerStatus: "pending",
        notes: `Converted from parent submission. Message: ${submission.message || "None"}`,
      });

      // Update submission status
      await updateSubmissionStatus(submission.id, "converted");
    } catch {
      setActionError("Failed to convert to learner. Check permissions.");
    } finally {
      setIsConverting(null);
    }
  }

  const columns: TableColumn<ParentSubmissionRecord>[] = [
    {
      key: "date",
      header: "Date",
      render: (sub) => new Date(sub.createdAt).toLocaleDateString(),
    },
    {
      key: "learner",
      header: "Learner",
      render: (sub) => <span className="font-bold text-slate-950">{sub.learnerFirstName} {sub.learnerLastName}</span>,
    },
    { key: "parent", header: "Parent", render: (sub) => sub.parentName },
    { key: "phone", header: "Phone", render: (sub) => sub.parentPhone },
    { key: "programme", header: "Programme", render: (sub) => sub.programme },
    {
      key: "status",
      header: "Status",
      render: (sub) => (
        <Badge tone={sub.status === "new" ? "rose" : sub.status === "converted" ? "green" : "slate"}>
          {sub.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (sub) => (
        <div className="flex items-center gap-2">
          {sub.status === "new" && (
            <Button className="h-8 px-2 text-xs" onClick={() => handleMarkReviewed(sub)} type="button" variant="secondary">
              <Check size={14} />
              Mark Reviewed
            </Button>
          )}
          {sub.status !== "converted" && (
            <Button 
              className="h-8 px-2 text-xs" 
              onClick={() => handleConvertToLearner(sub)} 
              type="button" 
              disabled={isConverting === sub.id || !isConfigured}
            >
              <UserPlus size={14} />
              {isConverting === sub.id ? "Converting..." : "Convert to Learner"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        description={`${syncState}. Review parent forms and convert them into learner records.`}
        title="Parent Form Submissions"
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Button
            className="h-9 rounded-full px-4 text-sm"
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "primary" : "secondary"}
          >
            All Forms
          </Button>
          <Button
            className="h-9 rounded-full px-4 text-sm"
            onClick={() => setFilter("new")}
            variant={filter === "new" ? "primary" : "secondary"}
          >
            New
          </Button>
          <Button
            className="h-9 rounded-full px-4 text-sm"
            onClick={() => setFilter("reviewed")}
            variant={filter === "reviewed" ? "primary" : "secondary"}
          >
            Reviewed
          </Button>
          <Button
            className="h-9 rounded-full px-4 text-sm"
            onClick={() => setFilter("converted")}
            variant={filter === "converted" ? "primary" : "secondary"}
          >
            Converted
          </Button>
        </div>
      </div>

      {errorMessage && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errorMessage}</p>}
      {actionError && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{actionError}</p>}

      {filteredSubmissions.length > 0 ? (
        <Table columns={columns} getRowKey={(sub) => sub.id} rows={filteredSubmissions} />
      ) : (
        <EmptyState
          description="No parent submissions found."
          title="Inbox Empty"
        />
      )}
    </>
  );
}

export default ParentSubmissionsPage;
