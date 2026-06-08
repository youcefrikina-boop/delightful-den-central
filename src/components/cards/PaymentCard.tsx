import { useCRM } from "@/context/CRMProvider";
import type { Payment } from "@/lib/types";
import { PAYMENT_COLOR_BG, paymentColor, paymentTotals } from "@/lib/payment";
import { t } from "@/lib/i18n";
import { CreditCard } from "lucide-react";

export function PaymentCard({ payment, onChange }: { payment: Payment; onChange: (p: Payment) => void }) {
  const { lang } = useCRM();
  const totals = paymentTotals(payment);
  const color = paymentColor(payment);

  const inp = "w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100";

  return (
    <div className={`rounded-xl border-2 p-3 ${PAYMENT_COLOR_BG[color]}`}>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-300">
        <span className="inline-flex items-center gap-2"><CreditCard className="size-4" /> {t(lang, "payment")}</span>
        <label className="inline-flex items-center gap-1 text-[10px] normal-case">
          <input
            type="checkbox"
            checked={!!payment.customFlag}
            onChange={(e) => onChange({ ...payment, customFlag: e.target.checked })}
          />
          <span className="text-purple-300">{t(lang, "customLedger")}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "partsCost")}
          <input type="number" className={inp} value={payment.partsCost ?? ""} onChange={(e) => onChange({ ...payment, partsCost: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "laborCost")}
          <input type="number" className={inp} value={payment.laborCost ?? ""} onChange={(e) => onChange({ ...payment, laborCost: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
        <label className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "advance")}
          <input type="number" className={inp} value={payment.advance ?? ""} onChange={(e) => onChange({ ...payment, advance: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
        <div className="space-y-0.5 text-[11px] text-slate-400">
          {t(lang, "total")}
          <div className="rounded-md border border-slate-700/50 bg-[#0d1a2e]/70 px-2 py-1 text-sm font-semibold text-slate-100">{totals.total.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-md bg-[#0d1a2e]/60 px-2 py-1.5 text-sm">
        <span className="text-xs text-slate-400">{t(lang, "debt")}</span>
        <span className={`font-bold ${totals.remaining > 0 ? "text-red-300" : "text-emerald-300"}`}>{totals.remaining.toLocaleString()}</span>
      </div>

      <input
        type="text"
        placeholder={t(lang, "note")}
        value={payment.note ?? ""}
        onChange={(e) => onChange({ ...payment, note: e.target.value })}
        className="mt-2 w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
      />
    </div>
  );
}
