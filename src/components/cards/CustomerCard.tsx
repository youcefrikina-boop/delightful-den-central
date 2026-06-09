import { useMemo, useState } from "react";
import {
  Trash2, Pencil, FileText, Wrench, MapPin, Clock, Sparkles, Hourglass,
  ChevronDown, Search as SearchIcon, ShieldCheck, X,
} from "lucide-react";
import type { CRMRecord, Lang, Warranty } from "@/lib/types";
import { t } from "@/lib/i18n";
import { paymentTotals } from "@/lib/payment";
import { calculateTempsAttente } from "@/lib/calculateTempsAttente";
import { useCRM } from "@/context/CRMProvider";
import { WarrantyCard } from "@/components/cards/WarrantyCard";

interface Props {
  record: CRMRecord;
  lang: Lang;
  onEdit: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
}

type WarrantyTone = "active" | "expired" | "none";

function warrantyTone(w: Warranty | undefined): WarrantyTone {
  if (!w || w.status !== "under") return "none";
  if (w.endDate) {
    const end = new Date(w.endDate).getTime();
    if (!isNaN(end) && end < Date.now()) return "expired";
  }
  return "active";
}

export function CustomerCard({ record, lang, onEdit, onDelete, onShowDetails }: Props) {
  const { records, updateRecord } = useCRM();
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  const totals = paymentTotals(record.payment);
  const wait = calculateTempsAttente(record, lang);
  const isWaiting = record.status === "waiting";

  // ✨ Nouveau vs Visite N logic, based on phone history + completion
  const visitInfo = useMemo(() => {
    const phone = record.phone.trim();
    if (!phone) {
      return { showNew: record.status !== "done", visitN: record.visitNumber };
    }
    const sameClient = records.filter((r) => r.phone.trim() === phone);
    const anyDone = sameClient.some((r) => r.status === "done");
    const showNew = !anyDone && record.status !== "done";
    return { showNew, visitN: record.visitNumber };
  }, [records, record]);

  const wTone = warrantyTone(record.warranty);
  const warrantyBadge = {
    active: { cls: "bg-emerald-500 text-slate-950 ring-emerald-300", label: t(lang, "warrantyActiveBadge") },
    expired: { cls: "bg-amber-500 text-slate-950 ring-amber-300", label: t(lang, "warrantyExpiredBadge") },
    none: { cls: "bg-red-500 text-white ring-red-300", label: t(lang, "warrantyNoneBadge") },
  }[wTone];

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-800/80 bg-[#0e1a30] shadow-md transition hover:border-cyan-500/40">
      {/* Top action icons */}
      <div className="absolute end-3 top-3 flex items-center gap-1.5">
        <button onClick={onEdit} aria-label={t(lang, "edit")}
          className="grid size-7 place-items-center rounded-md bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onDelete} aria-label={t(lang, "delete")}
          className="grid size-7 place-items-center rounded-md bg-red-500/15 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/25">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2 pe-20">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-cyan-300" />
          <h3 className="truncate text-sm font-semibold text-slate-100">{record.client}</h3>
          <Wrench className="size-3.5 text-amber-300" />
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-slate-400">
          {record.phone && <div className="ltr:text-left">{record.phone}</div>}
          {record.zone && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3 text-rose-300" />
              <span className="truncate">{record.zone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Visit token (separated from client name) */}
      <div className="px-4 pb-1">
        {visitInfo.showNew ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 ring-1 ring-cyan-400/40">
            <Sparkles className="size-3" /> {t(lang, "newBadgeLabel")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-700/40 px-2 py-0.5 text-[10px] font-semibold text-slate-200 ring-1 ring-slate-600/60">
            {t(lang, "visit")} {visitInfo.visitN}
          </span>
        )}
      </div>

      {/* Status badges + warranty badge */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        {isWaiting && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-500/30">
            <Hourglass className="size-3" /> {t(lang, "st_waiting")}
          </span>
        )}
        {record.status === "done" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
            {t(lang, "st_done")}
          </span>
        )}
        {record.status === "cancelled" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/15 px-2 py-0.5 text-[10px] font-medium text-slate-300 ring-1 ring-slate-500/30">
            {t(lang, "st_cancelled")}
          </span>
        )}
        {record.finalState && (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-200 ring-1 ring-violet-500/30">
            {t(lang, "fs_" + record.finalState)}
          </span>
        )}

        {/* Warranty interactive badge */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setWarrantyOpen(true); }}
          className={`ms-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow ring-2 transition hover:scale-105 ${warrantyBadge.cls}`}
          aria-label={t(lang, "warranty")}
        >
          <ShieldCheck className="size-3" />
          {warrantyBadge.label}
        </button>
      </div>

      {/* Wait time */}
      <div className="mx-4 mb-2 rounded-md border border-slate-800 bg-[#0a1428] px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="size-3 text-cyan-300" />
          <span>⏱️ {t(lang, "waitTimeLabel")}</span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-slate-100">{wait.line1}</span>
          <span className="text-[10px] text-slate-500">{t(lang, "totalDays")}: {wait.totalDays} {t(lang, "daysShort")}</span>
        </div>
      </div>

      {/* Fault diagnostic */}
      {record.fault && (
        <div className="mx-4 mb-3 rounded-md border border-slate-800 bg-[#0a1428] px-3 py-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <SearchIcon className="size-3 text-amber-300" />
            <span>🔍 {t(lang, "faultDiagnostic")}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-slate-300">{record.fault}</p>
        </div>
      )}

      {/* Financial footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-800 bg-[#0a1428]/60 px-4 py-2.5">
        <div className="text-xs">
          <span className="text-slate-500">−</span>
          <span className="ms-1 font-bold text-red-400">{totals.remaining > 0 ? `${totals.remaining} -` : "0"}</span>
        </div>
        <div className="text-xs font-semibold text-emerald-300">{totals.total} دج</div>
      </div>

      <button
        onClick={onShowDetails}
        className="flex items-center justify-center gap-1 border-t border-slate-800 px-4 py-1.5 text-[11px] text-slate-400 transition hover:bg-slate-800/40 hover:text-cyan-300"
      >
        <ChevronDown className="size-3" />
        {t(lang, "showDetails")}
      </button>

      {/* Warranty mini-modal */}
      {warrantyOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setWarrantyOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0a1428] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <ShieldCheck className="size-4" /> {t(lang, "warranty")} — {record.client}
              </h3>
              <button
                onClick={() => setWarrantyOpen(false)}
                className="rounded-md border border-slate-700 p-1 text-slate-400 hover:text-slate-100"
                aria-label="close"
              >
                <X className="size-4" />
              </button>
            </div>
            <WarrantyCard
              warranty={record.warranty}
              onChange={(w) => updateRecord(record.id, { warranty: w })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
