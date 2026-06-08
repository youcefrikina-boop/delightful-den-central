import { useMemo } from "react";
import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Archive, RotateCcw } from "lucide-react";

export function ArchivesTimeline() {
  const { records, updateRecord, lang } = useCRM();
  const archived = records.filter((r) => r.status === "done" || r.status === "cancelled" || r.archivedAt);

  const grouped = useMemo(() => {
    const map = new Map<string, CRMRecord[]>();
    archived
      .slice()
      .sort((a, b) => (b.archivedAt ?? b.completionDate ?? b.createdAt).localeCompare(a.archivedAt ?? a.completionDate ?? a.createdAt))
      .forEach((r) => {
        const d = new Date(r.archivedAt ?? r.completionDate ?? r.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const arr = map.get(key) ?? [];
        arr.push(r);
        map.set(key, arr);
      });
    return Array.from(map.entries());
  }, [archived]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-cyan-300">
        <Archive className="size-5" />
        <h2 className="text-lg font-semibold">{t(lang, "tab_archives")}</h2>
        <span className="text-xs text-slate-400">({archived.length} {t(lang, "archivedOps")})</span>
      </div>

      {grouped.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">—</div>
      )}

      {grouped.map(([month, items]) => (
        <section key={month}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {new Date(month + "-01").toLocaleDateString(lang === "ar" ? "ar" : lang, { month: "long", year: "numeric" })}
          </h3>
          <ol className="relative space-y-3 border-s-2 border-slate-800 ps-5">
            {items.map((r) => (
              <li key={r.id} className="relative">
                <span className="absolute -start-[26px] top-2 size-3 rounded-full border-2 border-cyan-500 bg-[#060d1f]" />
                <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-slate-100">{r.client} — <span className="text-cyan-300 text-xs">{t(lang, "visit")} {r.visitNumber}</span></span>
                    <span className="text-xs text-slate-500">
                      {new Date(r.archivedAt ?? r.completionDate ?? r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{[r.brand, r.model, r.zone].filter(Boolean).join(" • ")}</div>
                  {r.diagnosticFinal && (
                    <div className="mt-2 rounded-md bg-[#0d1a2e]/60 p-2 text-xs text-slate-200">{r.diagnosticFinal}</div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                      {t(lang, "st_" + r.status)}
                    </span>
                    <button
                      onClick={() => updateRecord(r.id, { status: "inProgress", archivedAt: undefined })}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-slate-300 hover:border-cyan-500/50"
                    >
                      <RotateCcw className="size-3" /> {t(lang, "restore")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
