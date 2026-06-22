"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Plus, X, DatabaseBackup } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { seedDatabase } from "@/utils/seedDatabase";

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [formValues, setFormValues] = useState({
    organizationName: settings?.organizationName || "",
    currency: settings?.currency || "ZAR",
    defaultMonthlyFee: settings?.defaultMonthlyFee || 0,
    enrollmentFormEnabled: settings?.enrollmentFormEnabled ?? true,
  });
  const [programmes, setProgrammes] = useState<string[]>(settings?.programmes || []);
  const [newProgramme, setNewProgramme] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings({
      ...formValues,
      programmes,
    });
    setIsSaving(false);
    alert("Settings saved successfully.");
  };

  const handleAddProgramme = () => {
    if (newProgramme.trim() && !programmes.includes(newProgramme.trim())) {
      setProgrammes([...programmes, newProgramme.trim()]);
      setNewProgramme("");
    }
  };

  const handleRemoveProgramme = (prog: string) => {
    setProgrammes(programmes.filter(p => p !== prog));
  };

  const handleSeedDatabase = async () => {
    const confirm = window.confirm("Are you sure? This will insert demo data into your live Firestore.");
    if (!confirm) return;
    
    setIsSeeding(true);
    try {
      await seedDatabase();
      alert("Demo data has been seeded successfully. Reload the page to see changes.");
    } catch (e: unknown) {
      alert("Failed to seed database: " + (e as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Settings" 
        description="Manage your organization details, pricing, and programmes." 
      />
      
      <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <fieldset>
            <legend className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center w-full">
              <SettingsIcon size={18} className="mr-2 text-teal-600" /> Organization Details
            </legend>
            <div className="grid gap-6">
              <Input 
                label="Organization Name" 
                value={formValues.organizationName} 
                onChange={e => setFormValues(prev => ({...prev, organizationName: e.target.value}))} 
                required 
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input 
                  label="Default Monthly Fee" 
                  type="number" 
                  value={formValues.defaultMonthlyFee} 
                  onChange={e => setFormValues(prev => ({...prev, defaultMonthlyFee: Number(e.target.value)}))} 
                />
                <Input 
                  label="Currency" 
                  value={formValues.currency} 
                  onChange={e => setFormValues(prev => ({...prev, currency: e.target.value}))} 
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 w-full">Programmes / Classes</legend>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={newProgramme}
                  onChange={e => setNewProgramme(e.target.value)}
                  placeholder="e.g. Piano, Junior Dance, Grade 10 Math"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProgramme();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddProgramme} variant="secondary">
                  <Plus size={16} /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {programmes.map(prog => (
                  <span key={prog} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200">
                    {prog}
                    <button type="button" onClick={() => handleRemoveProgramme(prog)} className="text-slate-500 hover:text-rose-500 transition">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {programmes.length === 0 && (
                  <p className="text-sm text-slate-500">No programmes added yet.</p>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 w-full">Public Enrollment</legend>
            <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" 
                checked={formValues.enrollmentFormEnabled}
                onChange={e => setFormValues(prev => ({...prev, enrollmentFormEnabled: e.target.checked}))}
              />
              <div>
                <span className="text-slate-900 font-bold block">Enable Public Enrollment Form</span>
                <span className="text-slate-500 text-sm">Allow parents to submit their details via the /enroll page.</span>
              </div>
            </label>
            {formValues.enrollmentFormEnabled && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-800">
                The enrollment form is live at: <strong>{typeof window !== 'undefined' ? `${window.location.origin}/parent-form` : '/parent-form'}</strong>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center w-full">
              <DatabaseBackup size={18} className="mr-2 text-rose-600" /> Developer Tools
            </legend>
            <div className="p-4 rounded-lg border border-rose-100 bg-rose-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-900">Seed Demo Data</p>
                <p className="text-sm text-rose-700">Injects TKM Music Academy demo data into the live database.</p>
              </div>
              <Button type="button" onClick={handleSeedDatabase} disabled={isSeeding} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isSeeding ? "Seeding..." : "Seed Data"}
              </Button>
            </div>
          </fieldset>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save size={16} className="mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SettingsPage;
