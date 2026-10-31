import { useEffect, useMemo, useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t, SERVICE_TYPE_LABEL } from "@/lib/i18n";
import { filterCustomers, type CustomerSort } from "@/lib/customerFilters";
import type { Status } from "@/lib/types";
import { CustomerCard } from "@/components/cards/CustomerCard";
import { CustomerEditModal } from "@/components/cards/CustomerEditModal";
import { DataTable } from "@/components/tabs/DataTable";
import { Search, Globe, Zap, Wrench, ClipboardCheck } from "lucide-react";
import type { CRMRecord } from "@/lib/types";

interface Props {
  view: "grid" | "list";
}

const STATUSES: (Status | "all")[] = ["all", "waiting", "done", "cancelled"];
const SERVICE_TYPES: string[] = ["all", "boiler", "heating", "plumbing", "pvc", "gas", "handyman", "allWorks"];

export function CustomersGrid({ view }: Props) {
  const { records, lang, deleteRecord } = useCRM();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState<CRMRecord | null>(null);

  const [sort, setSort] = useState<CustomerSort>("newest");
  const [customServices, setCustomServices] = useState<{ value: string; label: string }[]>([]);
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("dafatek_opts_serviceType") ?? "{}");
      setCustomServices(Array.isArray(stored.custom) ? stored.custom : []);
      setServiceOverrides(stored.overrides ?? {});
    } catch { /* Keep built-in options if saved options are invalid. */ }
  }, []);
  const services = [...new Set([...SERVICE_TYPES, ...customServices.map(s => s.value), ...records.map(r => r.serviceType)])];
  const filtered = useMemo(() => filterCustomers(records, query, statusFilter, serviceFilter, sort, fieldFilter),
    [records, query, statusFilter, serviceFilter, sort, fieldFilter]);

  return (
    <div className="space-y-4">
      {/* Sub-toolbar: search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-slate-800 bg-[#0a1428] px-3 py-2">
          <Search className="size-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t(lang, "search")}...`}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-xs text-slate-200 hover:border-cyan-500/50">
          <Globe className="size-3.5 text-cyan-300" />
          {t(lang, "quickEdit")}
        </button>

        <div className="relative">
          <select
            aria-label={t(lang, "status")}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
            className="appearance-none rounded-lg border border-slate-700 bg-[#0d1a2e] py-2 ps-3 pe-9 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? `${t(lang, "all")} ⚡` : t(lang, "st_" + s)}
              </option>
            ))}
          </select>
          <Zap className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-amber-300" />
        </div>

        <div className="crm-controls flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t(lang, "sortBy")}
            <select aria-label={t(lang, "sortBy")} value={sort} onChange={e => setSort(e.target.value as CustomerSort)}
              className="max-w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground">
              <option value="newest">{t(lang, "sortNewest")}</option>
              <option value="oldest">{t(lang, "sortOldest")}</option>
              <option value="name">{t(lang, "client")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardCheck className="size-3.5 text-primary" />{t(lang, "fieldStatus")}
            <select aria-label={t(lang, "fieldStatus")} value={fieldFilter} onChange={e => setFieldFilter(e.target.value)}
              className="max-w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground">
              <option value="all">{t(lang, "all")}</option>
              <option value="inspected">{t(lang, "field_inspected")}</option>
              <option value="notInspected">{t(lang, "field_notInspected")}</option>
              <option value="unset">{t(lang, "field_unset")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wrench className="size-3.5 text-primary" />{t(lang, "serviceType")}
            <select aria-label={t(lang, "serviceType")} value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
              className="max-w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground">
              {services.map(s => <option key={s} value={s}>{s === "all" ? t(lang, "all") :
                serviceOverrides[s] ?? customServices.find(c => c.value === s)?.label ?? SERVICE_TYPE_LABEL[lang][s] ?? s.replace(/^custom:/, "").split(":")[0].replaceAll("_", " ")}</option>)}
            </select>
          </label>
        </div>

        <span className="rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-[11px] text-slate-400">
          {filtered.length} / {records.length}
        </span>
      </div>

      {/* Grid of cards */}
      {view === "list" ? <DataTable selectedRecords={filtered} hideSearch /> : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          {t(lang, "noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <CustomerCard
              key={r.id}
              record={r}
              lang={lang}
              onEdit={() => setEditingRecord(r)}
              onShowDetails={() => setEditingRecord(r)}
              onDelete={() => {
                if (confirm(`${t(lang, "delete")} — ${r.client}?`)) deleteRecord(r.id);
              }}
            />
          ))}
        </div>
      )}

      {editingRecord && (
        <CustomerEditModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
}
