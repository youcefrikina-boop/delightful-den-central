import { useCRM } from "@/context/CRMProvider";
import type { Warranty } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ShieldCheck } from "lucide-react";

export function WarrantyCard({ warranty, onChange }: { warranty?: Warranty; onChange: (w: Warranty) => void }) {
  const { lang } = useCRM();
  const w: Warranty = warranty ?? { status: "out" };
  const inp = "w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100";
  const active = w.status === "under";

  return (
    <div className={`rounded-xl border-2 p-3 ${active ? "border-cyan-500/60 bg-cyan-500/5" : "border-slate-600/60 bg-slate-700/10"}`}>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
        <ShieldCheck className="size-4" /> {t(lang, "warranty")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-0.5 text-[11px] text-slate-400 col-span-2">
          {t(lang, "warranty")}
          <select className={inp} value={w.status} onChange={(e) => onChange({ ...w, status: e.target.value as "under" | "out" })}>
            <option value="under">{t(lang, "underWarranty")}</option>
            <option value="out">{t(lang, "outOfWarranty")}</option>
          </select>
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400 col-span-2">
          {t(lang, "warrantyCompany")}
          <input className={inp} value={w.company ?? ""} onChange={(e) => onChange({ ...w, company: e.target.value })} />
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400 col-span-2">
          {t(lang, "boilerSerial")}
          <input className={inp} value={w.serial ?? ""} onChange={(e) => onChange({ ...w, serial: e.target.value })} />
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "warrantyStart")}
          <input type="date" className={inp} value={w.startDate ?? ""} onChange={(e) => onChange({ ...w, startDate: e.target.value })} />
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "warrantyEnd")}
          <input type="date" className={inp} value={w.endDate ?? ""} onChange={(e) => onChange({ ...w, endDate: e.target.value })} />
        </label>
      </div>
    </div>
  );
}
