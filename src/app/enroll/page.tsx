"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function EnrollPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "parentSubmissions"), {
        ...formValues,
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to submit the form. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-md w-full text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h1>
          <p className="text-slate-600 mb-6">Your registration has been submitted successfully. We will be in touch with you shortly.</p>
          <Button onClick={() => window.location.reload()}>Submit Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-950 p-6 text-white text-center">
          <p className="text-xs font-bold uppercase text-teal-400 tracking-wider">Registration Form</p>
          <h1 className="text-3xl font-black mt-2">Enroll Your Child</h1>
        </div>
        <div className="p-6 sm:p-8">
          {error && <p className="bg-rose-50 text-rose-700 p-3 rounded-lg mb-6 font-medium text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <fieldset className="grid gap-4">
              <legend className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 w-full pb-1">Learner Details</legend>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" required value={formValues.learnerFirstName} onChange={e => setFormValues(prev => ({...prev, learnerFirstName: e.target.value}))} />
                <Input label="Last Name" required value={formValues.learnerLastName} onChange={e => setFormValues(prev => ({...prev, learnerLastName: e.target.value}))} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Class/Grade" required value={formValues.className} onChange={e => setFormValues(prev => ({...prev, className: e.target.value}))} />
                <Input label="Programme" required value={formValues.programme} onChange={e => setFormValues(prev => ({...prev, programme: e.target.value}))} />
                <Input label="Instrument/Activity" value={formValues.instrumentOrActivity} onChange={e => setFormValues(prev => ({...prev, instrumentOrActivity: e.target.value}))} />
              </div>
            </fieldset>

            <fieldset className="grid gap-4 mt-2">
              <legend className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 w-full pb-1">Parent/Guardian Details</legend>
              <Input label="Full Name" required value={formValues.parentName} onChange={e => setFormValues(prev => ({...prev, parentName: e.target.value}))} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Phone Number" required type="tel" value={formValues.parentPhone} onChange={e => setFormValues(prev => ({...prev, parentPhone: e.target.value}))} />
                <Input label="Email Address" type="email" value={formValues.parentEmail} onChange={e => setFormValues(prev => ({...prev, parentEmail: e.target.value}))} />
              </div>
              <Input label="Emergency Contact (Name & Number)" required value={formValues.emergencyContact} onChange={e => setFormValues(prev => ({...prev, emergencyContact: e.target.value}))} />
            </fieldset>

            <fieldset className="grid gap-4 mt-2">
              <legend className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 w-full pb-1">Additional Information</legend>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                <span>Notes / Message (Optional)</span>
                <textarea
                  className="w-full min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  value={formValues.message}
                  onChange={e => setFormValues(prev => ({...prev, message: e.target.value}))}
                />
              </label>
            </fieldset>

            <Button type="submit" disabled={isSubmitting} className="mt-4 py-3 text-lg">
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
