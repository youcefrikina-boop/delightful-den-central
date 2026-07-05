import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useCRM } from "@/context/CRMProvider";
import { QuickEntryForm } from "@/components/tabs/QuickEntryForm";
import type { CRMRecord, Status, FinalState, Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Plus, Calendar, Phone, MapPin, X } from "lucide-react";

type Frame = "day" | "week" | "month";
type ColumnKey = "waiting" | "enRoute" | "awaitingParts" | "done";

const COLUMNS: { key: ColumnKey; titleKey: string; tint: string; accent: string }[] = [
  { key: "waiting",       titleKey: "kb_colWaiting",       tint: "bg-amber-500/5   border-amber-500/20",   accent: "text-amber-300" },
  { key: "enRoute",       titleKey: "kb_colEnRoute",       tint: "bg-sky-500/5     border-sky-500/20",     accent: "text-sky-300" },
  { key: "awaitingParts", titleKey: "kb_colAwaitingParts", tint: "bg-violet-500/5  border-violet-500/20",  accent: "text-violet-300" },
  { key: "done",          titleKey: "kb_colDone",          tint: "bg-emerald-500/5 border-emerald-500/20", accent: "text-emerald-300" },
];

function priorityOf(r: CRMRecord, lang: Lang): { label: string; cls: string; rank: 0 | 1 | 2 } {
  const now = Date.now();
  if (r.appointment) {
    const diffH = (new Date(r.appointment).getTime() - now) / 36e5;
    if (diffH <= 24) return { label: t(lang, "kb_prHigh"), cls: "bg-rose-500/15 text-rose-300 border-rose-500/30", rank: 0 };
    if (diffH <= 72) return { label: t(lang, "kb_prMedium"), cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", rank: 1 };
  }
  if (r.warranty?.status === "under") return { label: t(lang, "kb_prMedium"), cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", rank: 1 };
  return { label: t(lang, "kb_prLow"), cls: "bg-slate-500/15 text-slate-300 border-slate-500/30", rank: 2 };
}

function columnOf(r: CRMRecord): ColumnKey {
  if (r.status === "done") return "done";
  if (r.status === "cancelled") return "done";
  if (r.finalState === "awaitingParts") return "awaitingParts";
  if (r.finalState === "enRoute") return "enRoute";
  return "waiting";
}

function inFrame(r: CRMRecord, frame: Frame): boolean {
  const ref = r.appointment ?? r.createdAt;
  if (!ref) return true;
  const d = new Date(ref).getTime();
  const now = Date.now();
  const day = 86400000;
  const span = frame === "day" ? day : frame === "week" ? 7 * day : 30 * day;
  return Math.abs(d - now) <= span;
}

export function KanbanBoard() {
  const { records, updateRecord } = useCRM();
  const [frame, setFrame] = useState<Frame>("week");
  const [showAdd, setShowAdd] = useState(false);
  const [active, setActive] = useState<CRMRecord | null>(null);

  const grouped = useMemo(() => {
    const map: Record<ColumnKey, CRMRecord[]> = { waiting: [], enRoute: [], awaitingParts: [], done: [] };
    for (const r of records) {
      if (!inFrame(r, frame)) continue;
      map[columnOf(r)].push(r);
    }
    for (const k of Object.keys(map) as ColumnKey[]) {
      map[k].sort((a, b) => priorityOf(a).rank - priorityOf(b).rank);
    }
    return map;
  }, [records, frame]);

  const onDragEnd = (res: DropResult) => {
    if (!res.destination) return;
    const dest = res.destination.droppableId as ColumnKey;
    const src = res.source.droppableId as ColumnKey;
    if (dest === src) return;
    const id = res.draggableId;
    const patch: Partial<CRMRecord> = {};
    if (dest === "done") {
      patch.status = "done" as Status;
      patch.finalState = undefined;
      patch.completionDate = new Date().toISOString();
    } else {
      patch.status = "waiting" as Status;
      patch.finalState = dest === "waiting" ? undefined : (dest as FinalState);
    }
    updateRecord(id, patch);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-700 bg-[#0a1428]">
          {(["day", "week", "month"] as Frame[]).map((f) => {
            const label = f === "day" ? "اليوم" : f === "week" ? "الأسبوع" : "الشهر";
            const active = frame === f;
            return (
              <button
                key={f}
                onClick={() => setFrame(f)}
                className={`px-4 py-1.5 text-xs font-medium transition ${
                  active ? "bg-cyan-500/20 text-cyan-200" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.45)] hover:from-cyan-300 hover:to-cyan-400"
        >
          <Plus className="size-3.5" /> إضافة عميل سريع
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-cyan-500/30 bg-[#0a1428] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-cyan-300">إدخال سريع</h3>
            <button onClick={() => setShowAdd(false)} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>
          <QuickEntryForm />
        </div>
      )}

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border p-3 transition ${col.tint} ${
                    snapshot.isDraggingOver ? "ring-2 ring-cyan-400/50" : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${col.accent}`}>{col.title}</h3>
                    <span className="rounded-full border border-slate-700 bg-[#0d162d]/80 px-2 py-0.5 text-[10px] text-slate-300">
                      {grouped[col.key].length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[120px]">
                    {grouped[col.key].map((r, idx) => {
                      const pr = priorityOf(r);
                      return (
                        <Draggable draggableId={r.id} index={idx} key={r.id}>
                          {(dp, ds) => (
                            <div
                              ref={dp.innerRef}
                              {...dp.draggableProps}
                              {...dp.dragHandleProps}
                              onClick={() => setActive(r)}
                              className={`group cursor-grab rounded-lg border border-slate-700/80 bg-[#0d162d]/90 p-3 shadow transition hover:border-cyan-500/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] active:cursor-grabbing ${
                                ds.isDragging ? "rotate-1 scale-[1.02] border-cyan-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : ""
                              }`}
                            >
                              <div className="mb-1.5 flex items-start justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-100 truncate">{r.client || "—"}</div>
                                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${pr.cls}`}>
                                  {pr.label}
                                </span>
                              </div>
                              {(r.appointment || r.zone) && (
                                <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                                  {r.appointment && (
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="size-3" />
                                      {new Date(r.appointment).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" })}
                                    </span>
                                  )}
                                  {r.zone && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="size-3" /> {r.zone}
                                    </span>
                                  )}
                                </div>
                              )}
                              {(r.fault || r.serviceType) && (
                                <div className="line-clamp-2 text-[11px] text-slate-300">
                                  {r.fault || r.serviceType}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {grouped[col.key].length === 0 && (
                      <div className="grid h-24 place-items-center rounded-lg border border-dashed border-slate-700/60 text-[11px] text-slate-500">
                        اسحب البطاقات هنا
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Details Modal */}
      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setActive(null)}>
          <div
            className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0a1428] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-cyan-300">{active.client}</h3>
                <div className="text-[11px] text-slate-400">تفاصيل المتابعة الفنية</div>
              </div>
              <button onClick={() => setActive(null)} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">
                <X className="size-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Info label="الهاتف" value={active.phone} icon={<Phone className="size-3" />} />
              <Info label="المنطقة" value={active.zone} icon={<MapPin className="size-3" />} />
              <Info label="نوع الخدمة" value={active.serviceType} />
              <Info label="المكان" value={active.installationLocation} />
              <Info label="الماركة" value={active.brand} />
              <Info label="الموديل" value={active.model} />
              <Info label="الموعد" value={active.appointment ? new Date(active.appointment).toLocaleString("ar") : "—"} />
              <Info label="الحالة" value={active.status} />
              {active.finalState && <Info label="الحالة النهائية" value={active.finalState} />}
              {active.assignedTech && <Info label="الفني" value={active.assignedTech} />}
            </div>

            {active.fault && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-[#060d1f] p-3">
                <div className="mb-1 text-[10px] uppercase text-slate-500">العطل / الوصف</div>
                <div className="text-xs text-slate-200">{active.fault}</div>
              </div>
            )}
            {active.diagnosticFinal && (
              <div className="mt-2 rounded-lg border border-slate-700 bg-[#060d1f] p-3">
                <div className="mb-1 text-[10px] uppercase text-slate-500">التشخيص النهائي</div>
                <div className="text-xs text-slate-200">{active.diagnosticFinal}</div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActive(null)}
                className="rounded-md bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-[#060d1f] px-3 py-2">
      <div className="mb-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="truncate text-slate-200">{value || "—"}</div>
    </div>
  );
}
