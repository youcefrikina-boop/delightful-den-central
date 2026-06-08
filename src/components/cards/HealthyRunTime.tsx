import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord } from "@/lib/types";
import { previousCompletedForPhone } from "@/lib/visitNaming";
import { diffBreakdown, formatBreakdown } from "@/lib/duration";
import { t } from "@/lib/i18n";
import { Activity } from "lucide-react";

export function HealthyRunTime({ record }: { record: CRMRecord }) {
  const { records, lang } = useCRM();
  const prev = previousCompletedForPhone(records, record);
  if (!prev || !prev.completionDate) return null;

  const b = diffBreakdown(prev.completionDate, record.createdAt);
  const { line1, line2 } = formatBreakdown(b, lang);

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-200">
        <Activity className="size-4" /> {t(lang, "healthyRunTime")}
      </div>
      <div className="text-sm font-semibold text-slate-100">{line1}</div>
      <div className="text-[11px] text-emerald-300">{line2}</div>
    </div>
  );
}
