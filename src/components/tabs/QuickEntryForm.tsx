import { useState, type FormEvent, type ReactNode } from "react";
import { useCRM } from "@/context/CRMProvider";
import { ALL_BRANDS, BRAND_MODELS } from "@/lib/brandModels";
import { t, SERVICE_TYPE_LABEL } from "@/lib/i18n";
import type {
  BoilerAction, InstallationLocation, ServiceType, Status,
  FinalState, Warranty, Task, Lang,
} from "@/lib/types";
import { Plus, Save } from "lucide-react";
import { EditableSelect } from "@/components/EditableSelect";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

const STATUSES: Status[] = ["waiting", "done", "cancelled"];
const FINAL_STATES: FinalState[] = ["awaitingParts", "enRoute", "warrantyFollowUp"];
const SERVICE_TYPES: ServiceType[] = ["boiler", "heating", "plumbing", "pvc", "gas", "handyman", "allWorks"];
const BOILER_ACTIONS: BoilerAction[] = ["repair", "maintenance", "descaling", "remove", "install"];

const serviceTypeOpts = (lang: Lang) =>
  SERVICE_TYPES.map((s) => ({ value: s, label: SERVICE_TYPE_LABEL[lang][s] }));
const locationOpts = (lang: Lang) => [
  { value: "home", label: t(lang, "locHome") },
  { value: "workshop", label: t(lang, "locWorkshop") },
  { value: "projects", label: "🏗️ " + t(lang, "locProjects") },
];
const statusOpts = (lang: Lang) =>
  STATUSES.map((s) => ({ value: s, label: t(lang, "st_" + s) }));
const finalStateOpts = (lang: Lang) =>
  FINAL_STATES.map((fs) => ({ value: fs, label: t(lang, "fs_" + fs) }));

export function QuickEntryForm() {
  const { addRecord, lang } = useCRM();
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("boiler");
  const [installationLocation, setInstallationLocation] = useState<InstallationLocation>("home");
  const [boilerAction, setBoilerAction] = useState<BoilerAction>("repair");
  const [status, setStatus] = useState<Status>("waiting");
  const [finalState, setFinalState] = useState<FinalState | "">("");
  const [fault, setFault] = useState("");
  const [warranty, setWarranty] = useState<Warranty>({ status: "out" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDraft, setTaskDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const matchedKey = ALL_BRANDS.find((k) => k.toLowerCase() === brand.trim().toLowerCase());
  const modelsForBrand = matchedKey ? BRAND_MODELS[matchedKey] : [];
  const isBoiler = serviceType === "boiler";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!client.trim()) return;
    addRecord({
      client: client.trim(),
      phone: phone.trim(),
      zone: zone.trim(),
      brand: brand.trim(),
      model: model.trim(),
      serviceType,
      installationLocation,
      boilerAction: isBoiler ? boilerAction : undefined,
      status,
      finalState: status === "waiting" ? (finalState || undefined) : undefined,
      fault: fault.trim(),
      warranty: isBoiler ? warranty : undefined,
      tasks: isBoiler ? [] : tasks,
      payment: {},
    });
    setClient(""); setPhone(""); setZone(""); setBrand(""); setModel(""); setFault("");
    setWarranty({ status: "out" }); setTasks([]); setTaskDraft("");
    setStatus("waiting"); setFinalState(""); setServiceType("boiler");
    setBoilerAction("repair"); setInstallationLocation("home");
    setToast(t(lang, "saved"));
    setTimeout(() => setToast(null), 2200);
  }

  function addTask() {
    if (!taskDraft.trim()) return;
    setTasks((arr) => [...arr, { id: crypto.randomUUID(), text: taskDraft.trim(), done: false }]);
    setTaskDraft("");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-slate-800 bg-[#0a1428] p-5 shadow-xl">
      <div className="flex items-center gap-2 text-cyan-300">
        <Plus className="size-5" />
        <h2 className="text-lg font-semibold">{t(lang, "quickEntry")}</h2>
      </div>

      <datalist id="brand-list">
        {ALL_BRANDS.map((b) => <option key={b} value={b} />)}
      </datalist>
      <datalist id="model-list">
        {modelsForBrand.map((m) => <option key={m} value={m} />)}
      </datalist>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t(lang, "client") + " *"}>
          <input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} required />
        </Field>
        <Field label={t(lang, "phone")}>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
        </Field>
        <Field label={t(lang, "zone")} className="sm:col-span-2">
          <input className={inputClass} value={zone} onChange={(e) => setZone(e.target.value)} />
        </Field>

        <Field label={t(lang, "serviceType")}>
          <select className={inputClass} value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{SERVICE_TYPE_LABEL[lang][s]}</option>
            ))}
          </select>
        </Field>
        <Field label={t(lang, "location")}>
          <select className={inputClass} value={installationLocation} onChange={(e) => setInstallationLocation(e.target.value as InstallationLocation)}>
            <option value="home">{t(lang, "locHome")}</option>
            <option value="workshop">{t(lang, "locWorkshop")}</option>
            <option value="projects">🏗️ {t(lang, "locProjects")}</option>
          </select>
        </Field>

        {isBoiler && (
          <>
            <Field label={t(lang, "boilerAction")}>
              <select className={inputClass} value={boilerAction} onChange={(e) => setBoilerAction(e.target.value as BoilerAction)}>
                {BOILER_ACTIONS.map((a) => (
                  <option key={a} value={a}>{t(lang, "act" + a[0].toUpperCase() + a.slice(1))}</option>
                ))}
              </select>
            </Field>
            <Field label={t(lang, "brand")}>
              <input list="brand-list" className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Saunier Duval, Vaillant…" />
            </Field>
            <Field label={t(lang, "model") + ` (${t(lang, "customModel")})`} className="sm:col-span-2">
              <input list="model-list" className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Themaplus Condens…" />
            </Field>
          </>
        )}

        <Field label={t(lang, "status")}>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(lang, "st_" + s)}</option>
            ))}
          </select>
        </Field>
        <Field label={t(lang, "finalState")}>
          <select
            className={inputClass}
            value={finalState}
            onChange={(e) => setFinalState(e.target.value as FinalState | "")}
            disabled={status !== "waiting"}
          >
            <option value="">{t(lang, "fs_none")}</option>
            {FINAL_STATES.map((fs) => (
              <option key={fs} value={fs}>{t(lang, "fs_" + fs)}</option>
            ))}
          </select>
        </Field>
        <Field label={t(lang, "fault")} className="sm:col-span-2">
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            value={fault}
            onChange={(e) => setFault(e.target.value)}
          />
        </Field>
      </div>

      {isBoiler && (
        <fieldset className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <legend className="px-2 text-sm font-semibold text-cyan-200">{t(lang, "warranty")}</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t(lang, "warranty")}>
              <select className={inputClass} value={warranty.status} onChange={(e) => setWarranty({ ...warranty, status: e.target.value as "under" | "out" })}>
                <option value="under">{t(lang, "underWarranty")}</option>
                <option value="out">{t(lang, "outOfWarranty")}</option>
              </select>
            </Field>
            <Field label={t(lang, "warrantyCompany")}>
              <input className={inputClass} value={warranty.company ?? ""} onChange={(e) => setWarranty({ ...warranty, company: e.target.value })} />
            </Field>
            <Field label={t(lang, "boilerSerial")}>
              <input className={inputClass} value={warranty.serial ?? ""} onChange={(e) => setWarranty({ ...warranty, serial: e.target.value })} />
            </Field>
            <Field label={t(lang, "warrantyStart")}>
              <input type="date" className={inputClass} value={warranty.startDate ?? ""} onChange={(e) => setWarranty({ ...warranty, startDate: e.target.value })} />
            </Field>
            <Field label={t(lang, "warrantyEnd")} className="sm:col-span-2">
              <input type="date" className={inputClass} value={warranty.endDate ?? ""} onChange={(e) => setWarranty({ ...warranty, endDate: e.target.value })} />
            </Field>
          </div>
        </fieldset>
      )}

      {!isBoiler && (
        <fieldset className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <legend className="px-2 text-sm font-semibold text-amber-200">{t(lang, "tasks")}</legend>
          <ul className="mb-2 space-y-1">
            {tasks.map((tk) => (
              <li key={tk.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tk.done}
                  onChange={() => setTasks((arr) => arr.map((x) => (x.id === tk.id ? { ...x, done: !x.done } : x)))}
                />
                <span className={tk.done ? "text-slate-400 line-through" : "text-slate-100"}>{tk.text}</span>
                <button type="button" onClick={() => setTasks((arr) => arr.filter((x) => x.id !== tk.id))} className="ms-auto text-xs text-red-300">×</button>
              </li>
            ))}
            {tasks.length === 0 && <li className="text-xs text-slate-500">—</li>}
          </ul>
          <div className="flex gap-2">
            <input className={inputClass} value={taskDraft} onChange={(e) => setTaskDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }} />
            <button type="button" onClick={addTask} className="rounded-md bg-amber-500/80 px-3 py-1 text-sm font-semibold text-slate-950 hover:bg-amber-400">
              {t(lang, "addTask")}
            </button>
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">dafatek_crm_records_v4</div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          <Save className="size-4" /> {t(lang, "save")}
        </button>
      </div>

      {toast && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {toast}
        </div>
      )}
    </form>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className="text-xs uppercase text-slate-400">{label}</span>
      {children}
    </label>
  );
}
