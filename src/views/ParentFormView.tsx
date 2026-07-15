"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSubmission } from "@/hooks/useParentSubmissions";

export function ParentFormView() {
  const searchParams = useSearchParams();
  const tenantId = searchParams?.get("tenantId") || searchParams?.get("tenant") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formValues, setFormValues] = useState({
    learnerFirstName: "",
    learnerLastName: "",
    className: "",
    programme: "",
    instrumentOrActivity: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (!tenantId.trim()) {
        throw new Error("Missing tenantId");
      }
      await createSubmission(formValues, {
        tenantId: tenantId.trim(),
        userId: "public-form",
      });
      setIsSuccess(true);
    } catch {
      setErrorMsg(
        tenantId
          ? "Failed to submit the form. Please check your connection and try again."
          : "This form requires a tenant link (?tenantId=...). Contact your school for the correct enrollment URL.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h1>
          <p className="text-slate-600 mb-8">
            Your details have been successfully submitted to the programme administrator.
          </p>
          <Button onClick={() => window.location.reload()} variant="secondary" className="w-full">
            Submit Another Learner
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center text-white">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/10 mb-4">
            <ShieldCheck size={24} className="text-teal-400" />
          </div>
          <h1 className="text-2xl font-black mb-2">Learner Registration Form</h1>
          <p className="text-slate-300">Please provide your details below.</p>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Learner Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  value={formValues.learnerFirstName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, learnerFirstName: e.target.value }))}
                />
                <Input
                  label="Last Name"
                  required
                  value={formValues.learnerLastName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, learnerLastName: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Class/Grade"
                  required
                  value={formValues.className}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, className: e.target.value }))}
                />
                <Input
                  label="Programme"
                  required
                  value={formValues.programme}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, programme: e.target.value }))}
                />
                <Input
                  label="Instrument/Activity"
                  value={formValues.instrumentOrActivity}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, instrumentOrActivity: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Parent / Guardian Details
              </h2>
              <Input
                label="Full Name"
                required
                value={formValues.parentName}
                onChange={(e) => setFormValues((prev) => ({ ...prev, parentName: e.target.value }))}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  required
                  value={formValues.parentPhone}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, parentPhone: e.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formValues.parentEmail}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, parentEmail: e.target.value }))}
                />
              </div>
              <Input
                label="Emergency Contact"
                value={formValues.emergencyContact}
                onChange={(e) => setFormValues((prev) => ({ ...prev, emergencyContact: e.target.value }))}
              />
              <Input
                label="Message"
                value={formValues.message}
                onChange={(e) => setFormValues((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
