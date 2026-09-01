"use client";

import { Music2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useProgrammes } from "../hooks/useProgrammes";
import type { ProgrammeFormValues, ProgrammeType } from "../types";

const initialValues: ProgrammeFormValues = {
  name: "",
  programmeType: "music",
  description: "",
  programmeStatus: "active",
};

export function ProgrammesPage() {
  const { programmes, groups, syncState, errorMessage, isConfigured, createProgramme, deleteProgramme } = useProgrammes();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProgrammeFormValues>(initialValues);
  const [formError, setFormError] = useState("");
  const [filter, setFilter] = useState<"all" | ProgrammeType>("all");

  const visibleProgrammes = useMemo(
    () => programmes.filter((programme) => filter === "all" || programme.programmeType === filter),
    [programmes, filter],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Programme name is required.");
      return;
    }
    setIsSaving(true);
    try {
      await createProgramme({ ...form, name: form.name.trim(), description: form.description?.trim() });
      setForm(initialValues);
      setIsOpen(false);
    } catch {
      setFormError("Programme could not be saved. Check Firebase access and permissions.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeProgramme(id: string, name: string) {
    if (!window.confirm(`Archive ${name}? Existing learner records will not be changed.`)) return;
    await deleteProgramme(id);
  }

  return (
    <>
      <PageHeader
        title="Programmes"
        description={`${syncState}. Shared Music and Dance programme management.`}
        action={
          <Button disabled={!isConfigured} onClick={() => setIsOpen(true)} type="button">
            <Plus size={16} /> Add programme
          </Button>
        }
      />

      {errorMessage ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <button type="button" onClick={() => setFilter("all")} className={`rounded-2xl border p-5 text-left ${filter === "all" ? "border-[#6c5ce7] bg-[#eee9ff]" : "border-white bg-white"}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">All programmes</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{programmes.length}</p>
        </button>
        <button type="button" onClick={() => setFilter("music")} className={`rounded-2xl border p-5 text-left ${filter === "music" ? "border-[#6c5ce7] bg-[#eee9ff]" : "border-white bg-white"}`}>
          <Music2 className="mb-3 text-[#6c5ce7]" size={22} />
          <p className="text-sm font-bold text-slate-900">Music</p>
          <p className="text-2xl font-black text-slate-900">{programmes.filter((p) => p.programmeType === "music").length}</p>
        </button>
        <button type="button" onClick={() => setFilter("dance")} className={`rounded-2xl border p-5 text-left ${filter === "dance" ? "border-[#ff6b81] bg-rose-50" : "border-white bg-white"}`}>
          <Sparkles className="mb-3 text-[#ff6b81]" size={22} />
          <p className="text-sm font-bold text-slate-900">Dance</p>
          <p className="text-2xl font-black text-slate-900">{programmes.filter((p) => p.programmeType === "dance").length}</p>
        </button>
      </div>

      {visibleProgrammes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProgrammes.map((programme) => {
            const groupCount = groups.filter((group) => group.programmeId === programme.id).length;
            return (
              <article key={programme.id} className="rounded-2xl border border-white bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone={programme.programmeType === "music" ? "purple" : "rose"}>{programme.programmeType}</Badge>
                    <h3 className="mt-3 text-lg font-black text-slate-950">{programme.name}</h3>
                    <p className="mt-1 min-h-10 text-sm text-slate-500">{programme.description || "No description yet."}</p>
                  </div>
                  <Button className="h-9 px-3 text-rose-700" variant="ghost" type="button" onClick={() => removeProgramme(programme.id, programme.name)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <span className="font-semibold text-slate-500">Groups / classes</span>
                  <span className="font-black text-slate-900">{groupCount}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No programmes found" description="Create the first Music or Dance programme for this organisation." />
      )}

      <Modal isOpen={isOpen} onClose={() => !isSaving && setIsOpen(false)} title="Add programme">
        <form className="grid gap-4" onSubmit={submit}>
          <Input id="programmeName" label="Programme name" value={form.name} required onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          <Select id="programmeType" label="Programme type" value={form.programmeType} onChange={(e) => setForm((current) => ({ ...current, programmeType: e.target.value as ProgrammeType }))}>
            <option value="music">Music</option>
            <option value="dance">Dance</option>
          </Select>
          <label className="grid gap-2 text-sm font-bold text-slate-700" htmlFor="programmeDescription">
            <span>Description</span>
            <textarea id="programmeDescription" className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#6c5ce7] focus:ring-4 focus:ring-[#6c5ce7]/10" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          </label>
          {formError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !isConfigured}>{isSaving ? "Saving..." : "Create programme"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ProgrammesPage;
