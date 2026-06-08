import { useCRM } from "@/context/CRMProvider";
import type { Status } from "@/lib/types";
import { calculateTempsAttente } from "@/lib/calculateTempsAttente";
import { RichDuration } from "@/components/cards/RichDuration";
import { t } from "@/lib/i18n";
import { Radio } from "lucide-react";

const STATUSES: Status[] = ["new", "inProgress", "waitingParts", "done", "cancelled"];

export function RadarDispatcher() {
  const { records, updateRecord, technician, lang } = useCRM();
  const active = records.filter((r) => r.status !== "done" && r.status !== "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-300">
        <Radio className="size-5 animate-pulse" />
        <h2 className="text-lg font-semibold">{t(lang, "tab_radar")}</h2>
        <span className="text-xs text-slate-400">({active.length} {t(lang, "activeOps")})</span>
      </div>

      {active.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          —
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {active.map((r) => {
          const td = calculateTempsAttente(r, lang);
          return (
            <div key={r.id} className="space-y-3 rounded-xl border border-slate-800 bg-[#0a1428] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-100">{r.client}</div>
                  <div className="text-xs text-cyan-300">{t(lang, "visit")} {r.visitNumber}</div>
                  <div className="text-xs text-slate-400">{[r.brand, r.model].filter(Boolean).join(" ")}</div>
                  <div className="text-xs text-slate-500">{r.zone}</div>
                </div>
                <RichDuration data={td} />
              </div>

              <div className="rounded-lg border border-slate-700/60 bg-[#0d1a2e]/40 p-2 text-xs text-slate-200">
                {r.fault || "—"}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400">{t(lang, "technician")}</span>
                  <input
                    value={r.assignedTech ?? ""}
                    onChange={(e) => updateRecord(r.id, { assignedTech: e.target.value })}
                    placeholder={technician || t(lang, "technician")}
                    className="w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400">{t(lang, "status")}</span>
                  <select
                    value={r.status}
                    onChange={(e) => updateRecord(r.id, { status: e.target.value as Status })}
                    className="w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{t(lang, "st_" + s)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] uppercase text-slate-400">{t(lang, "finalDiagnostic")}</span>
                <textarea
                  value={r.diagnosticFinal ?? ""}
                  onChange={(e) => updateRecord(r.id, { diagnosticFinal: e.target.value })}
                  className="min-h-16 w-full resize-y rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateRecord(r.id, { status: "done", completionDate: new Date().toISOString(), archivedAt: new Date().toISOString() })}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  {t(lang, "markDone")}
                </button>
                {technician && !r.assignedTech && (
                  <button
                    onClick={() => updateRecord(r.id, { assignedTech: technician })}
                    className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/20"
                  >
                    {t(lang, "assignTech")} ({technician})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
