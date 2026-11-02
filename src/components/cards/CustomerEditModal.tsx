import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Save, UserRoundPen, X } from "lucide-react";
import { EditableSelect } from "@/components/EditableSelect";
import { TasksChecklist } from "@/components/cards/TasksChecklist";
import { LocationField } from '@/components/cards/LocationField';
import { useCRM } from "@/context/CRMProvider";
import { ALL_BRANDS, BRAND_MODELS } from "@/lib/brandModels";
import { SERVICE_TYPE_LABEL, t } from "@/lib/i18n";
import type { CRMRecord, FieldStatus, FinalState, InstallationLocation, Lang, ServiceType, Status } from "@/lib/types";

interface Props {
  record: CRMRecord;
  onClose: () => void;
}

const STATUSES: Status[] = ["waiting", "done", "cancelled"];
const FINAL_STATES: FinalState[] = ["awaitingParts", "enRoute", "warrantyFollowUp"];
const SERVICE_TYPES: ServiceType[] = ["boiler", "heating", "plumbing", "pvc", "gas", "handyman", "allWorks"];
const BOILER_ACTIONS = ["repair", "maintenance", "descaling", "remove", "install"];

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

const serviceOptions = (lang: Lang) => SERVICE_TYPES.map((value) => ({ value, label: SERVICE_TYPE_LABEL[lang][value] }));
const locationOptions = (lang: Lang) => [
  { value: "home", label: t(lang, "locHome") },
  { value: "workshop", label: t(lang, "locWorkshop") },
  { value: "projects", label: `🏗️ ${t(lang, "locProjects")}` },
];
const statusOptions = (lang: Lang) => STATUSES.map((value) => ({ value, label: t(lang, `st_${value}`) }));
const finalStateOptions = (lang: Lang) => FINAL_STATES.map((value) => ({ value, label: t(lang, `fs_${value}`) }));
const fieldStatusOptions = (lang: Lang) => [
  { value: "inspected", label: t(lang, "field_inspected") },
  { value: "notInspected", label: t(lang, "field_notInspected") },
];
const boilerActionOptions = (lang: Lang) => BOILER_ACTIONS.map((value) => ({
  value,
  label: t(lang, `act${value[0].toUpperCase()}${value.slice(1)}`),
}));

export function CustomerEditModal({ record, onClose }: Props) {
  const { lang, updateRecord } = useCRM();
  const [draft, setDraft] = useState<CRMRecord>(record);

  useEffect(() => setDraft(record), [record]);

  const models = BRAND_MODELS[ALL_BRANDS.find((brand) => brand.toLowerCase() === draft.brand.trim().toLowerCase()) ?? ""] ?? [];
  const isBoiler = draft.serviceType === "boiler";

  function patch(values: Partial<CRMRecord>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.client.trim()) return;
    const saved = await updateRecord(record.id, {
      ...draft,
      client: draft.client.trim(),
      phone: draft.phone.trim(),
      zone: draft.zone.trim(),
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      fault: draft.fault.trim(),
      finalState: draft.status === "waiting" ? draft.finalState : undefined,
      boilerAction: isBoiler ? draft.boilerAction : undefined,
    });
    if (saved) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-[#0a1428] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0a1428] px-4 py-3">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-cyan-300">
            <UserRoundPen className="size-4 shrink-0" />
            <span className="truncate">{t(lang, "edit")} — {record.client}</span>
          </h2>
          <button type="button" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-md border border-slate-700 text-slate-400 hover:text-slate-100" aria-label={t(lang, "kb_close")}>
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <Field label={`${t(lang, "client")} *`}>
            <input autoFocus required className={inputClass} value={draft.client} onChange={(e) => patch({ client: e.target.value })} />
          </Field>
          <Field label={t(lang, "phone")}>
            <input type="tel" className={inputClass} value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </Field>
          <Field label={t(lang, "zone")} className="sm:col-span-2">
            <input className={inputClass} value={draft.zone} onChange={(e) => patch({ zone: e.target.value })} />
          </Field>
          <Field label={t(lang, "registrationDate")}>
            <input type="datetime-local" className={inputClass} value={draft.createdAt.slice(0, 16)} onChange={(e) => patch({ createdAt: new Date(e.target.value).toISOString() })} />
          </Field>
          <div className="sm:col-span-2 crm-controls"><LocationField value={draft.manualLocation ?? ''} onChange={manualLocation => patch({manualLocation})} /></div>
          <Field label={t(lang, "completionDate")}>
            <input type="datetime-local" className={inputClass} value={draft.completionDate?.slice(0, 16) ?? ""} onChange={(e) => patch({ completionDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </Field>
          <Field label={t(lang, "serviceType")}>
            <EditableSelect storageKey="dafatek_opts_serviceType" baseOptions={serviceOptions(lang)} value={draft.serviceType} onChange={(value) => patch({ serviceType: value as ServiceType })} />
          </Field>
          <Field label={t(lang, "location")}>
            <EditableSelect storageKey="dafatek_opts_location" baseOptions={locationOptions(lang)} value={draft.installationLocation} onChange={(value) => patch({ installationLocation: value as InstallationLocation })} />
          </Field>
          <Field label={t(lang, "status")}>
            <EditableSelect storageKey="dafatek_opts_status" baseOptions={statusOptions(lang)} value={draft.status} onChange={(value) => {
              const status = value as Status;
              patch({
                status,
                finalState: status === "waiting" ? draft.finalState : undefined,
                completionDate: status === "done" && !draft.completionDate ? new Date().toISOString() : draft.completionDate,
              });
            }} />
          </Field>
          <Field label={t(lang, "finalState")}>
            <EditableSelect storageKey="dafatek_opts_finalState" baseOptions={finalStateOptions(lang)} value={draft.finalState ?? ""} onChange={(value) => patch({ finalState: (value || undefined) as FinalState | undefined })} disabled={draft.status !== "waiting"} allowEmpty emptyLabel={t(lang, "fs_none")} />
          </Field>
          <Field label={t(lang, "fieldStatus")}>
            <EditableSelect storageKey="dafatek_opts_fieldStatus" baseOptions={fieldStatusOptions(lang)} value={draft.fieldStatus ?? ""} onChange={(value) => patch({ fieldStatus: (value || undefined) as FieldStatus | undefined })} allowEmpty emptyLabel={t(lang, "field_unset")} />
          </Field>

          {isBoiler && (
            <>
              <Field label={t(lang, "boilerAction")}>
                <EditableSelect storageKey="dafatek_opts_boilerAction" baseOptions={boilerActionOptions(lang)} value={draft.boilerAction ?? "repair"} onChange={(value) => patch({ boilerAction: value })} />
              </Field>
              <Field label={t(lang, "brand")}>
                <input list={`edit-brand-${record.id}`} className={inputClass} value={draft.brand} onChange={(e) => patch({ brand: e.target.value })} />
                <datalist id={`edit-brand-${record.id}`}>{ALL_BRANDS.map((brand) => <option key={brand} value={brand} />)}</datalist>
              </Field>
              <Field label={t(lang, "model")} className="sm:col-span-2">
                <input list={`edit-model-${record.id}`} className={inputClass} value={draft.model} onChange={(e) => patch({ model: e.target.value })} />
                <datalist id={`edit-model-${record.id}`}>{models.map((model) => <option key={model} value={model} />)}</datalist>
              </Field>
            </>
          )}

          <Field label={t(lang, "fault")} className="sm:col-span-2">
            <textarea className={`${inputClass} min-h-24 resize-y`} value={draft.fault} onChange={(e) => patch({ fault: e.target.value })} />
          </Field>
          <Field label={t(lang, "finalDiagnostic")} className="sm:col-span-2">
            <textarea className={`${inputClass} min-h-20 resize-y`} value={draft.diagnosticFinal ?? ""} onChange={(e) => patch({ diagnosticFinal: e.target.value })} />
          </Field>
          <div className="min-w-0 sm:col-span-2">
            <TasksChecklist record={draft} onTasksChange={(tasks) => patch({ tasks })} />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-800 bg-[#0a1428] px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{t(lang, "kb_close")}</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            <Save className="size-4" /> {t(lang, "save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className="text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}