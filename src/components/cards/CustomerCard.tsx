import { Trash2, Pencil, FileText, Wrench, MapPin, Clock, Sparkles, Hourglass, ChevronDown, Search as SearchIcon } from "lucide-react";
import type { CRMRecord, Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { paymentTotals } from "@/lib/payment";
import { calculateTempsAttente } from "@/lib/calculateTempsAttente";

interface Props {
  record: CRMRecord;
  lang: Lang;
  onEdit: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
}

export function CustomerCard({ record, lang, onEdit, onDelete, onShowDetails }: Props) {
  const totals = paymentTotals(record.payment);
  const wait = calculateTempsAttente(record, lang);
  const isWaiting = record.status === "new" || record.status === "waitingParts" || record.status === "inProgress";
  const isNew = record.status === "new";

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-800/80 bg-[#0e1a30] shadow-md transition hover:border-cyan-500/40">
      {/* Top action icons */}
      <div className="absolute end-3 top-3 flex items-center gap-1.5">
        <button
          onClick={onEdit}
          aria-label={t(lang, "edit")}
          className="grid size-7 place-items-center rounded-md bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={onDelete}
          aria-label={t(lang, "delete")}
          className="grid size-7 place-items-center rounded-md bg-red-500/15 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/25"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2 pe-20">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-cyan-300" />
          <h3 className="truncate text-sm font-semibold text-slate-100">
            {record.client} <span className="text-slate-400">— {t(lang, "visit")} {record.visitNumber}</span>
          </h3>
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

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        {isWaiting && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-500/30">
            <Hourglass className="size-3" /> En attente
          </span>
        )}
        {isNew && (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300 ring-1 ring-sky-500/30">
            <Sparkles className="size-3" /> Nouveau
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-600/40">
          <span className="size-1.5 rounded-full bg-slate-500" /> Bloqué
        </span>
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

      {/* Show details trigger */}
      <button
        onClick={onShowDetails}
        className="flex items-center justify-center gap-1 border-t border-slate-800 px-4 py-1.5 text-[11px] text-slate-400 transition hover:bg-slate-800/40 hover:text-cyan-300"
      >
        <ChevronDown className="size-3" />
        {t(lang, "showDetails")}
      </button>
    </div>
  );
}
