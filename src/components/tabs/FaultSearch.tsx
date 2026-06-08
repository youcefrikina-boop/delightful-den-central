import { useMemo, useState } from "react";
import { FAULT_CODES } from "@/lib/faultCodes";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { AlertTriangle, Search } from "lucide-react";

export function FaultSearch() {
  const { lang } = useCRM();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("");

  const brands = useMemo(() => Array.from(new Set(FAULT_CODES.map((f) => f.brand))).sort(), []);
  const filtered = FAULT_CODES.filter((f) => {
    if (brand && f.brand !== brand) return false;
    const blob = `${f.code} ${f.brand} ${f.symptom} ${f.cause} ${f.fix}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-300">
        <AlertTriangle className="size-5" />
        <h2 className="text-lg font-semibold">{t(lang, "tab_faults")}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#0a1428] p-3">
        <Search className="size-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(lang, "search") + " — F22, EA1…"}
          className="flex-1 rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
        >
          <option value="">{t(lang, "brand")}</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
          {t(lang, "noResults")}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((f) => (
          <article key={`${f.brand}-${f.code}`} className="rounded-xl border border-slate-800 bg-[#0a1428] p-4">
            <header className="flex items-baseline justify-between">
              <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-sm font-bold text-amber-200">
                {f.code}
              </span>
              <span className="text-xs uppercase text-slate-400">{f.brand}</span>
            </header>
            <h3 className="mt-2 font-semibold text-slate-100">{f.symptom}</h3>
            <p className="mt-1 text-xs text-slate-400">{f.cause}</p>
            <p className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-200">
              ✦ {f.fix}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
