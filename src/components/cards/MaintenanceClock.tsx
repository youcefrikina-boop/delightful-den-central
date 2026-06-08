import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord } from "@/lib/types";
import { t } from "@/lib/i18n";
import { AlertCircle, Timer } from "lucide-react";

export function MaintenanceClock({ record }: { record: CRMRecord }) {
  const { lang, updateRecord } = useCRM();
  const inp = "rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100";

  const defaultNext = (() => {
    const d = new Date(record.completionDate ?? record.createdAt);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const nextDate = record.nextMaintenanceDate ?? defaultNext;
  const alertDays = record.maintenanceAlertDays ?? 7;
  const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / 86_400_000);
  const overdue = days < 0;
  const nearing = !overdue && days <= alertDays;

  return (
    <div className={`rounded-xl border p-3 ${overdue ? "border-red-500/60 bg-red-500/10" : nearing ? "border-amber-500/60 bg-amber-500/10" : "border-slate-700/60 bg-[#0d1a2e]/60"}`}>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-300">
        <span className="inline-flex items-center gap-2"><Timer className="size-4" /> {t(lang, "nextMaintenance")}</span>
        {(overdue || nearing) && <AlertCircle className={`size-4 ${overdue ? "text-red-400" : "text-amber-300"} animate-pulse`} />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className={inp}
          value={nextDate}
          onChange={(e) => updateRecord(record.id, { nextMaintenanceDate: e.target.value })}
        />
        <input
          type="number"
          className={inp}
          value={alertDays}
          min={0}
          onChange={(e) => updateRecord(record.id, { maintenanceAlertDays: Number(e.target.value) || 0 })}
          aria-label={t(lang, "alertBefore")}
        />
      </div>
      <div className={`mt-1 text-xs ${overdue ? "text-red-300" : nearing ? "text-amber-300" : "text-slate-400"}`}>
        {overdue ? `${t(lang, "delay")} ${-days} ${t(lang, "days")}` : `${days} ${t(lang, "days")} ${t(lang, "remaining")}`}
      </div>
      <div className="text-[10px] text-slate-500">{t(lang, "alertBefore")}: {alertDays}</div>
    </div>
  );
}
