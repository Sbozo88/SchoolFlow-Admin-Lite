"use client";

import { Music2, Plus, Sparkles, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useProgrammes } from "../hooks/useProgrammes";
import type { ProgrammeFormValues, ProgrammeGroupFormValues, ProgrammeType } from "../types";

const initialProgramme: ProgrammeFormValues = { name: "", programmeType: "music", description: "", programmeStatus: "active" };
const emptyGroup = (programmeId = ""): ProgrammeGroupFormValues => ({
  programmeId,
  name: "",
  groupType: "class",
  level: "",
  teacherId: "",
  venue: "",
  capacity: 20,
  groupStatus: "active",
});

export function ProgrammesPage() {
  const { programmes, groups, syncState, errorMessage, isConfigured, createProgramme, deleteProgramme, createGroup } = useProgrammes();
  const [isProgrammeOpen, setProgrammeOpen] = useState(false);
  const [isGroupOpen, setGroupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [programmeForm, setProgrammeForm] = useState<ProgrammeFormValues>(initialProgramme);
  const [groupForm, setGroupForm] = useState<ProgrammeGroupFormValues>(emptyGroup());
  const [formError, setFormError] = useState("");
  const [filter, setFilter] = useState<"all" | ProgrammeType>("all");

  const visibleProgrammes = useMemo(
    () => programmes.filter((programme) => filter === "all" || programme.programmeType === filter),
    [programmes, filter],
  );

  async function submitProgramme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!programmeForm.name.trim()) return setFormError("Programme name is required.");
    setIsSaving(true);
    try {
      await createProgramme({ ...programmeForm, name: programmeForm.name.trim(), description: programmeForm.description?.trim() });
      setProgrammeForm(initialProgramme);
      setProgrammeOpen(false);
    } catch {
      setFormError("Programme could not be saved. Check Firebase access and permissions.");
    } finally {
      setIsSaving(false);
    }
  }

  function openGroup(programmeId: string) {
    setFormError("");
    setGroupForm(emptyGroup(programmeId));
    setGroupOpen(true);
  }

  async function submitGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!groupForm.programmeId || !groupForm.name.trim()) return setFormError("Programme and group name are required.");
    setIsSaving(true);
    try {
      await createGroup({ ...groupForm, name: groupForm.name.trim(), level: groupForm.level?.trim(), venue: groupForm.venue?.trim() });
      setGroupOpen(false);
    } catch {
      setFormError("Group could not be saved. Check Firebase access and permissions.");
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
        action={<Button disabled={!isConfigured} onClick={() => setProgrammeOpen(true)} type="button"><Plus size={16} /> Add programme</Button>}
      />
      {errorMessage ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <button type="button" onClick={() => setFilter("all")} className={`rounded-2xl border p-5 text-left ${filter === "all" ? "border-[#6c5ce7] bg-[#eee9ff]" : "border-white bg-white"}`}><p className="text-xs font-bold uppercase tracking-wide text-slate-400">All programmes</p><p className="mt-2 text-3xl font-black text-slate-900">{programmes.length}</p></button>
        <button type="button" onClick={() => setFilter("music")} className={`rounded-2xl border p-5 text-left ${filter === "music" ? "border-[#6c5ce7] bg-[#eee9ff]" : "border-white bg-white"}`}><Music2 className="mb-3 text-[#6c5ce7]" size={22} /><p className="text-sm font-bold text-slate-900">Music</p><p className="text-2xl font-black text-slate-900">{programmes.filter((p) => p.programmeType === "music").length}</p></button>
        <button type="button" onClick={() => setFilter("dance")} className={`rounded-2xl border p-5 text-left ${filter === "dance" ? "border-[#ff6b81] bg-rose-50" : "border-white bg-white"}`}><Sparkles className="mb-3 text-[#ff6b81]" size={22} /><p className="text-sm font-bold text-slate-900">Dance</p><p className="text-2xl font-black text-slate-900">{programmes.filter((p) => p.programmeType === "dance").length}</p></button>
      </div>

      {visibleProgrammes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProgrammes.map((programme) => {
            const programmeGroups = groups.filter((group) => group.programmeId === programme.id);
            return (
              <article key={programme.id} className="rounded-2xl border border-white bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div><Badge tone={programme.programmeType === "music" ? "purple" : "rose"}>{programme.programmeType}</Badge><h3 className="mt-3 text-lg font-black text-slate-950">{programme.name}</h3><p className="mt-1 text-sm text-slate-500">{programme.description || "No description yet."}</p></div>
                  <Button className="h-9 px-3 text-rose-700" variant="ghost" type="button" onClick={() => removeProgramme(programme.id, programme.name)}><Trash2 size={15} /></Button>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between"><span className="font-semibold text-slate-500">Groups / classes</span><Button className="h-9 px-3" variant="secondary" type="button" onClick={() => openGroup(programme.id)}><Plus size={14} /> Add group</Button></div>
                  {programmeGroups.length ? <div className="grid gap-2">{programmeGroups.map((group) => <div key={group.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><div><p className="text-sm font-bold text-slate-900">{group.name}</p><p className="text-xs text-slate-500">{group.level || group.groupType}{group.venue ? ` · ${group.venue}` : ""}</p></div><div className="flex items-center gap-1 text-xs font-bold text-slate-500"><UsersRound size={14} /> {group.capacity || "—"}</div></div>)}</div> : <p className="text-sm text-slate-400">No groups yet.</p>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No programmes found" description="Create the first Music or Dance programme for this organisation." />}

      <Modal isOpen={isProgrammeOpen} onClose={() => !isSaving && setProgrammeOpen(false)} title="Add programme">
        <form className="grid gap-4" onSubmit={submitProgramme}>
          <Input id="programmeName" label="Programme name" value={programmeForm.name} required onChange={(e) => setProgrammeForm((current) => ({ ...current, name: e.target.value }))} />
          <Select id="programmeType" label="Programme type" value={programmeForm.programmeType} onChange={(e) => setProgrammeForm((current) => ({ ...current, programmeType: e.target.value as ProgrammeType }))}><option value="music">Music</option><option value="dance">Dance</option></Select>
          <Input id="programmeDescription" label="Description" value={programmeForm.description || ""} onChange={(e) => setProgrammeForm((current) => ({ ...current, description: e.target.value }))} />
          {formError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button variant="secondary" type="button" onClick={() => setProgrammeOpen(false)} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving || !isConfigured}>{isSaving ? "Saving..." : "Create programme"}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isGroupOpen} onClose={() => !isSaving && setGroupOpen(false)} title="Add group / class">
        <form className="grid gap-4" onSubmit={submitGroup}>
          <Input id="groupName" label="Group / class name" value={groupForm.name} required onChange={(e) => setGroupForm((current) => ({ ...current, name: e.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2"><Input id="groupLevel" label="Level" value={groupForm.level || ""} onChange={(e) => setGroupForm((current) => ({ ...current, level: e.target.value }))} /><Input id="groupVenue" label="Venue" value={groupForm.venue || ""} onChange={(e) => setGroupForm((current) => ({ ...current, venue: e.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Select id="groupType" label="Group type" value={groupForm.groupType} onChange={(e) => setGroupForm((current) => ({ ...current, groupType: e.target.value }))}><option value="class">Class</option><option value="ensemble">Ensemble</option><option value="rehearsal-group">Rehearsal group</option><option value="dance-group">Dance group</option></Select><Input id="groupCapacity" label="Capacity" type="number" value={String(groupForm.capacity || 0)} onChange={(e) => setGroupForm((current) => ({ ...current, capacity: Number(e.target.value) || 0 }))} /></div>
          {formError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button variant="secondary" type="button" onClick={() => setGroupOpen(false)} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving || !isConfigured}>{isSaving ? "Saving..." : "Create group"}</Button></div>
        </form>
      </Modal>
    </>
  );
}

export default ProgrammesPage;
