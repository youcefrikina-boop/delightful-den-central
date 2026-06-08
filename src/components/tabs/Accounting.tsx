import { useMemo } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { paymentTotals, paymentColor } from "@/lib/payment";
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Clock, Flame, Hammer, Wrench, Thermometer, Pipette } from "lucide-react";
import type { CRMRecord, ServiceType } from "@/lib/types";

const SERVICE_META: Record<ServiceType, { icon: React.ReactNode; label: string; tone: string }> = {
  boiler: { icon: <Flame className="size-3.5" />, label: "Chaudière", tone: "text-orange-300 bg-orange-500/15" },
  heating: { icon: <Thermometer className="size-3.5" />, label: "Chauffage", tone: "text-rose-300 bg-rose-500/15" },
  plumbing: { icon: <Pipette className="size-3.5" />, label: "Plombier", tone: "text-sky-300 bg-sky-500/15" },
  pvc: { icon: <Wrench className="size-3.5" />, label: "PVC", tone: "text-purple-300 bg-purple-500/15" },
  gas: { icon: <Flame className="size-3.5" />, label: "Gaz", tone: "text-amber-300 bg-amber-500/15" },
  handyman: { icon: <Hammer className="size-3.5" />, label: "Bricolage", tone: "text-yellow-300 bg-yellow-500/15" },
  allWorks: { icon: <Wrench className="size-3.5" />, label: "Tout", tone: "text-slate-300 bg-slate-500/15" },
};

export function Accounting() {
  const { records, lang } = useCRM();

  const stats = useMemo(() => {
    let revenue = 0, paid = 0, debt = 0;
    let cPaid = 0, cPartial = 0, cDebt = 0;
    const debtors: { r: CRMRecord; total: number; remaining: number }[] = [];
    const paidList: { r: CRMRecord; total: number }[] = [];
    records.forEach((r) => {
      const tot = paymentTotals(r.payment);
      revenue += tot.total;
      paid += tot.advance;
      debt += tot.remaining;
      const c = paymentColor(r.payment);
      if (c === "paid") { cPaid++; paidList.push({ r, total: tot.total }); }
      else if (c === "partial") { cPartial++; debtors.push({ r, total: tot.total, remaining: tot.remaining }); }
      else if (c === "debt") { cDebt++; debtors.push({ r, total: tot.total, remaining: tot.remaining }); }
    });
    debtors.sort((a, b) => b.remaining - a.remaining);
    paidList.sort((a, b) => b.total - a.total);
    return { revenue, paid, debt, cPaid, cPartial, cDebt, debtors, paidList: paidList.slice(0, 5) };
  }, [records]);

  const totalStatus = stats.cPaid + stats.cPartial + stats.cDebt || 1;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2.5">
        <h2 className="text-base font-bold text-emerald-300">{t(lang, "financialSummary")}</h2>
        <div className="grid size-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
          <DollarSign className="size-5" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <KpiBox icon={<TrendingUp className="size-4" />} label={t(lang, "totalRevenue")} value={stats.revenue} tone="cyan" />
        <KpiBox icon={<CheckCircle2 className="size-4" />} label={t(lang, "totalPaid")} value={stats.paid} tone="emerald" />
        <KpiBox icon={<TrendingDown className="size-4" />} label={t(lang, "totalDebt")} value={stats.debt} tone="rose" />
      </div>

      {/* Distribution */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-4">
        <h3 className="mb-4 text-center text-sm font-semibold text-slate-200">{t(lang, "paymentStatusDistribution")}</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatusCircle icon={<AlertCircle className="size-5" />} count={stats.cDebt} label={t(lang, "debtor")} tone="rose" />
          <StatusCircle icon={<Clock className="size-5" />} count={stats.cPartial} label={t(lang, "partialPayment")} tone="amber" />
          <StatusCircle icon={<CheckCircle2 className="size-5" />} count={stats.cPaid} label={t(lang, "paidShort")} tone="emerald" />
        </div>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="bg-rose-500" style={{ width: `${(stats.cDebt / totalStatus) * 100}%` }} />
          <div className="bg-amber-500" style={{ width: `${(stats.cPartial / totalStatus) * 100}%` }} />
          <div className="bg-emerald-500" style={{ width: `${(stats.cPaid / totalStatus) * 100}%` }} />
        </div>
      </div>

      {/* Debtors */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3">
        <div className="mb-3 flex items-center justify-end gap-2 px-1">
          <h3 className="text-sm font-semibold text-rose-300">{t(lang, "debtorsList")}</h3>
          <span className="grid size-5 place-items-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300">{stats.debtors.length}</span>
          <AlertCircle className="size-4 text-rose-400" />
        </div>
        <ul className="space-y-1.5">
          {stats.debtors.map(({ r, total, remaining }) => {
            const meta = SERVICE_META[r.serviceType];
            return (
              <li key={r.id} className="relative overflow-hidden rounded-lg bg-[#0d1a2e] py-2 ps-3 pe-2">
                <span className="absolute inset-y-0 end-0 w-1 bg-rose-500" />
                <div className="flex items-center justify-between gap-2">
                  <div className="text-end text-xs">
                    <div className="font-bold text-rose-300">{total.toLocaleString()} {t(lang, "dzd")}</div>
                    <div className="text-[11px] text-rose-400">-{remaining.toLocaleString()} {t(lang, "dzd")}</div>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 text-end">
                      <div className="truncate text-sm font-medium text-slate-100">{r.client}</div>
                      <div className="truncate text-[10px] text-slate-500">Visite {r.visitNumber} · {r.phone}</div>
                    </div>
                    <span className={`grid size-7 place-items-center rounded-md ${meta.tone}`}>{meta.icon}</span>
                  </div>
                </div>
              </li>
            );
          })}
          {stats.debtors.length === 0 && (
            <li className="py-6 text-center text-xs text-slate-500">—</li>
          )}
        </ul>
      </div>

      {/* Top paid invoices */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3">
        <div className="mb-3 flex items-center justify-end gap-2 px-1">
          <h3 className="text-sm font-semibold text-emerald-300">{t(lang, "largestPaidInvoices")}</h3>
          <CheckCircle2 className="size-4 text-emerald-400" />
        </div>
        <ul className="space-y-1.5">
          {stats.paidList.map((item, i) => {
            const meta = SERVICE_META[item.r.serviceType];
            return (
              <li key={item.r.id} className="flex items-center justify-between rounded-lg bg-[#0d1a2e] px-3 py-2">
                <div className="text-sm font-bold text-emerald-300">{item.total.toLocaleString()} {t(lang, "dzd")}</div>
                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <div className="text-sm font-medium text-slate-100">{item.r.client}</div>
                    <div className="text-[10px] text-slate-500">{meta.label}</div>
                  </div>
                  <span className={`grid size-7 place-items-center rounded-md ${meta.tone}`}>{meta.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500">#{i + 1}</span>
                </div>
              </li>
            );
          })}
          {stats.paidList.length === 0 && (
            <li className="py-6 text-center text-xs text-slate-500">—</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function KpiBox({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "cyan" | "emerald" | "rose" }) {
  const tones = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
  };
  const { lang } = useCRM();
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3 text-end">
      <div className={`flex items-center justify-end gap-1.5 text-[10px] ${tones[tone]}`}>
        <span>{label}</span>
        <span className={tones[tone]}>{icon}</span>
      </div>
      <div className={`mt-1 text-xl font-bold ${tones[tone]}`}>{value.toLocaleString()}</div>
      <div className={`text-[10px] ${tones[tone]} opacity-70`}>{t(lang, "dzd")}</div>
    </div>
  );
}

function StatusCircle({ icon, count, label, tone }: { icon: React.ReactNode; count: number; label: string; tone: "rose" | "amber" | "emerald" }) {
  const tones = {
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  };
  const text = { rose: "text-rose-300", amber: "text-amber-300", emerald: "text-emerald-300" }[tone];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`grid size-11 place-items-center rounded-full border-2 ${tones[tone]}`}>{icon}</div>
      <div className={`text-xl font-bold ${text}`}>{count}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
