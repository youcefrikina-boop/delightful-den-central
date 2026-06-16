import { useState, type ReactNode } from "react";
import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord, FinalState, InstallationLocation, ServiceType, Status, Visit } from "@/lib/types";
import { EditableSelect } from "@/components/EditableSelect";
import { calculateTempsAttente } from "@/lib/calculateTempsAttente";
import { nextInnerVisitLabel } from "@/lib/visitNaming";
import { ALL_BRANDS, BRAND_MODELS } from "@/lib/brandModels";
import { t, SERVICE_TYPE_LABEL } from "@/lib/i18n";
import { RichDuration } from "@/components/cards/RichDuration";
import { PaymentCard } from "@/components/cards/PaymentCard";
import { WarrantyCard } from "@/components/cards/WarrantyCard";
import { AppointmentBadge } from "@/components/cards/AppointmentBadge";
import { GpsButton } from "@/components/cards/GpsButton";
import { MaintenanceClock } from "@/components/cards/MaintenanceClock";
import { DailyPlanToggle } from "@/components/cards/DailyPlanToggle";
import { HealthyRunTime } from "@/components/cards/HealthyRunTime";
import { TasksChecklist } from "@/components/cards/TasksChecklist";
import { ChevronDown, ChevronRight, Trash2, Search, Hash, Pencil, Check, X } from "lucide-react";

const STATUSES: Status[] = ["waiting", "done", "cancelled"];
const FINAL_STATES: FinalState[] = ["awaitingParts", "enRoute", "warrantyFollowUp"];
const SERVICE_TYPES: ServiceType[] = ["boiler", "heating", "plumbing", "pvc", "gas", "handyman", "allWorks"];
const BOILER_ACTIONS: BoilerAction[] = ["repair", "maintenance", "descaling", "remove", "install"];

const STATUS_COLOR: Record<Status, string> = {
  waiting: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  done: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

const inp = "w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100";

export function DataTable() {
  const { records, updateRecord, deleteRecord, lang } = useCRM();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = records.filter((r) =>
    [r.client, r.phone, r.zone, r.brand, r.model, r.fault].join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0a1428] px-3 py-2">
        <Search className="size-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, "search")}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <span className="text-xs text-slate-500">{filtered.length} / {records.length}</span>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          {t(lang, "noResults")}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const isOpen = expanded === r.id;
          const tempsAttente = calculateTempsAttente(r, lang);
          const isBoiler = r.serviceType === "boiler";

          return (
            <div key={r.id} className="rounded-xl border border-slate-800 bg-[#0a1428] shadow-sm">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-slate-800/40"
              >
                {isOpen ? <ChevronDown className="size-4 text-cyan-300" /> : <ChevronRight className="size-4 text-slate-400" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-100">{r.client}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">
                      <Hash className="size-3" /> {t(lang, "visit")} {r.visitNumber}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_COLOR[r.status]}`}>
                      {t(lang, "st_" + r.status)}
                    </span>
                    {r.inDailyPlan && (
                      <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                        {t(lang, "inDailyPlan")}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-400">
                    {[r.brand, r.model, r.zone, r.phone].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <RichDuration data={tempsAttente} />
                </div>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-800 p-4">
                  <div className="sm:hidden"><RichDuration data={tempsAttente} /></div>

                  {/* Inline editable identity */}
                  <fieldset className="rounded-xl border border-slate-700/60 bg-[#0d1a2e]/40 p-3">
                    <legend className="px-2 text-[11px] uppercase text-slate-400">{t(lang, "inline")}</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Field label={t(lang, "client")}>
                        <input className={inp} value={r.client} onChange={(e) => updateRecord(r.id, { client: e.target.value })} />
                      </Field>
                      <Field label={t(lang, "phone")}>
                        <input className={inp} value={r.phone} onChange={(e) => updateRecord(r.id, { phone: e.target.value })} />
                      </Field>
                      <Field label={t(lang, "zone")} className="sm:col-span-2">
                        <input className={inp} value={r.zone} onChange={(e) => updateRecord(r.id, { zone: e.target.value })} />
                      </Field>
                      <Field label={t(lang, "registrationDate")}>
                        <input type="datetime-local" className={inp} value={r.createdAt.slice(0, 16)} onChange={(e) => updateRecord(r.id, { createdAt: new Date(e.target.value).toISOString() })} />
                      </Field>
                      <Field label={t(lang, "completionDate")}>
                        <input type="datetime-local" className={inp} value={r.completionDate ? r.completionDate.slice(0, 16) : ""} onChange={(e) => updateRecord(r.id, { completionDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                      </Field>
                      <Field label={t(lang, "serviceType")}>
                        <select className={inp} value={r.serviceType} onChange={(e) => updateRecord(r.id, { serviceType: e.target.value as ServiceType })}>
                          {SERVICE_TYPES.map((s) => (
                            <option key={s} value={s}>{SERVICE_TYPE_LABEL[lang][s]}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t(lang, "location")}>
                        <select className={inp} value={r.installationLocation} onChange={(e) => updateRecord(r.id, { installationLocation: e.target.value as InstallationLocation })}>
                          <option value="home">{t(lang, "locHome")}</option>
                          <option value="workshop">{t(lang, "locWorkshop")}</option>
                          <option value="projects">🏗️ {t(lang, "locProjects")}</option>
                        </select>
                      </Field>
                      <Field label={t(lang, "status")}>
                        <select className={inp} value={r.status} onChange={(e) => {
                          const v = e.target.value as Status;
                          const patch: Partial<CRMRecord> = { status: v };
                          if (v === "done" && !r.completionDate) patch.completionDate = new Date().toISOString();
                          if (v !== "waiting") patch.finalState = undefined;
                          updateRecord(r.id, patch);
                        }}>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{t(lang, "st_" + s)}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t(lang, "finalState")}>
                        <select
                          className={inp}
                          value={r.finalState ?? ""}
                          disabled={r.status !== "waiting"}
                          onChange={(e) => updateRecord(r.id, { finalState: (e.target.value || undefined) as FinalState | undefined })}
                        >
                          <option value="">{t(lang, "fs_none")}</option>
                          {FINAL_STATES.map((fs) => (
                            <option key={fs} value={fs}>{t(lang, "fs_" + fs)}</option>
                          ))}
                        </select>
                      </Field>
                      {isBoiler && (
                        <>
                          <Field label={t(lang, "boilerAction")}>
                            <select className={inp} value={r.boilerAction ?? "repair"} onChange={(e) => updateRecord(r.id, { boilerAction: e.target.value as BoilerAction })}>
                              {BOILER_ACTIONS.map((a) => (
                                <option key={a} value={a}>{t(lang, "act" + a[0].toUpperCase() + a.slice(1))}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label={t(lang, "brand")}>
                            <input list={`brand-${r.id}`} className={inp} value={r.brand} onChange={(e) => updateRecord(r.id, { brand: e.target.value })} />
                            <datalist id={`brand-${r.id}`}>
                              {ALL_BRANDS.map((b) => <option key={b} value={b} />)}
                            </datalist>
                          </Field>
                          <Field label={t(lang, "model")} className="sm:col-span-2">
                            <input list={`model-${r.id}`} className={inp} value={r.model} onChange={(e) => updateRecord(r.id, { model: e.target.value })} />
                            <datalist id={`model-${r.id}`}>
                              {(BRAND_MODELS[r.brand] ?? []).map((m) => <option key={m} value={m} />)}
                            </datalist>
                          </Field>
                        </>
                      )}
                      <Field label={t(lang, "fault")} className="sm:col-span-2">
                        <textarea className={`${inp} min-h-20 resize-y`} value={r.fault} onChange={(e) => updateRecord(r.id, { fault: e.target.value })} />
                      </Field>
                      <Field label={t(lang, "finalDiagnostic")} className="sm:col-span-2">
                        <textarea className={`${inp} min-h-16 resize-y`} value={r.diagnosticFinal ?? ""} onChange={(e) => updateRecord(r.id, { diagnosticFinal: e.target.value })} />
                      </Field>
                    </div>
                  </fieldset>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <PaymentCard payment={r.payment} onChange={(p) => updateRecord(r.id, { payment: p })} />
                    {isBoiler ? (
                      <WarrantyCard warranty={r.warranty} onChange={(w) => updateRecord(r.id, { warranty: w })} />
                    ) : (
                      <TasksChecklist record={r} />
                    )}
                    <AppointmentBadge record={r} />
                    <MaintenanceClock record={r} />
                    <HealthyRunTime record={r} />
                  </div>

                  <VisitsBlock
                    record={r}
                    onAdd={(v) => updateRecord(r.id, { visits: [...r.visits, v] })}
                    onUpdateVisit={(idx, patch) =>
                      updateRecord(r.id, {
                        visits: r.visits.map((vv, i) => (i === idx ? { ...vv, ...patch } : vv)),
                      })
                    }
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <GpsButton record={r} />
                    <DailyPlanToggle active={r.inDailyPlan} onToggle={() => updateRecord(r.id, { inDailyPlan: !r.inDailyPlan })} />
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-sm text-slate-200 hover:border-cyan-500/50">
                        📞 {r.phone}
                      </a>
                    )}
                    <button
                      onClick={() => { if (confirm(`${t(lang, "delete")} — ${r.client}?`)) deleteRecord(r.id); }}
                      className="ms-auto inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="size-4" /> {t(lang, "delete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`space-y-0.5 ${className}`}>
      <span className="text-[10px] uppercase text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function VisitsBlock({
  record,
  onAdd,
  onUpdateVisit,
}: {
  record: CRMRecord;
  onAdd: (v: Visit) => void;
  onUpdateVisit: (index: number, patch: Partial<Visit>) => void;
}) {
  const { lang } = useCRM();
  const [note, setNote] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0d1a2e]/40 p-3">
      <div className="mb-2 text-xs uppercase text-slate-400">{t(lang, "addVisit")}</div>
      <ul className="space-y-1 text-sm text-slate-200">
        {record.visits.length === 0 && <li className="text-xs text-slate-500">—</li>}
        {record.visits.map((v, i) => {
          const isEditing = editingIdx === i;
          return (
            <li key={i} className="flex items-center gap-2 border-b border-slate-800/60 pb-1">
              <span className="font-semibold text-cyan-300 shrink-0">{v.label}</span>
              {isEditing ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onUpdateVisit(i, { notes: draft }); setEditingIdx(null); }
                    if (e.key === "Escape") setEditingIdx(null);
                  }}
                  className="flex-1 rounded-md border border-cyan-500/50 bg-[#0d1a2e] px-2 py-0.5 text-sm text-slate-100"
                />
              ) : (
                <span className="flex-1 text-slate-200">— {v.notes ?? "—"}</span>
              )}
              <span className="text-xs text-slate-500">{new Date(v.date).toLocaleDateString()}</span>
              {isEditing ? (
                <>
                  <button
                    onClick={() => { onUpdateVisit(i, { notes: draft }); setEditingIdx(null); }}
                    className="grid size-6 place-items-center rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    aria-label="save"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="grid size-6 place-items-center rounded-md bg-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                    aria-label="cancel"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setDraft(v.notes ?? ""); setEditingIdx(i); }}
                  className="grid size-6 place-items-center rounded-md bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                  aria-label={t(lang, "editVisit")}
                  title={t(lang, "editVisit")}
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t(lang, "note")}
          className="flex-1 rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
        />
        <button
          onClick={() => {
            const label = nextInnerVisitLabel(record.visits, lang);
            onAdd({ date: new Date().toISOString(), number: record.visits.length + 1, label, notes: note || "—" });
            setNote("");
          }}
          className="rounded-md bg-cyan-500/80 px-3 py-1 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          + {t(lang, "visit")}
        </button>
      </div>
    </div>
  );
}
