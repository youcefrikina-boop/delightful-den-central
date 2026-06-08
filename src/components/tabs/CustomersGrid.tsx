import { useMemo, useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t, SERVICE_TYPE_LABEL } from "@/lib/i18n";
import type { ServiceType, Status } from "@/lib/types";
import { CustomerCard } from "@/components/cards/CustomerCard";
import { DataTable } from "@/components/tabs/DataTable";
import { Search, Globe, Zap, Wrench } from "lucide-react";

interface Props {
  view: "grid" | "list";
  onSwitchToList: () => void;
}

const STATUSES: (Status | "all")[] = ["all", "new", "inProgress", "waitingParts", "done", "cancelled"];
const SERVICE_TYPES: (ServiceType | "all")[] = ["all", "boiler", "heating", "plumbing", "pvc", "gas", "handyman", "allWorks"];

export function CustomersGrid({ view, onSwitchToList }: Props) {
  const { records, lang, deleteRecord } = useCRM();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">("all");

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || [r.client, r.phone, r.zone, r.brand, r.model, r.fault].join(" ").toLowerCase().includes(q);
      const matchS = statusFilter === "all" || r.status === statusFilter;
      const matchT = serviceFilter === "all" || r.serviceType === serviceFilter;
      return matchQ && matchS && matchT;
    });
  }, [records, query, statusFilter, serviceFilter]);

  if (view === "list") return <DataTable />;

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

        <div className="relative">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceType | "all")}
            className="appearance-none rounded-lg border border-slate-700 bg-[#0d1a2e] py-2 ps-3 pe-9 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? `${t(lang, "all")} 🛠️` : SERVICE_TYPE_LABEL[lang][s]}
              </option>
            ))}
          </select>
          <Wrench className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-cyan-300" />
        </div>

        <span className="rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-[11px] text-slate-400">
          {filtered.length} / {records.length}
        </span>
      </div>

      {/* Grid of cards */}
      {filtered.length === 0 ? (
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
              onEdit={onSwitchToList}
              onShowDetails={onSwitchToList}
              onDelete={() => {
                if (confirm(`${t(lang, "delete")} — ${r.client}?`)) deleteRecord(r.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
