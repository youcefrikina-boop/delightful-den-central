import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { CalendarCheck2 } from "lucide-react";

export function DailyPlanToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const { lang } = useCRM();
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        active
          ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
          : "border-slate-700 bg-[#0d1a2e] text-slate-300 hover:border-amber-400/40"
      }`}
    >
      <CalendarCheck2 className="size-4" />
      {active ? t(lang, "inDailyPlan") : t(lang, "addToDailyPlan")}
    </button>
  );
}
