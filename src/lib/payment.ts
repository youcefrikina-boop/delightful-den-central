import type { Payment, PaymentColor } from "./types";

export function paymentTotals(p: Payment) {
  const parts = p.partsCost ?? 0;
  const labor = p.laborCost ?? 0;
  const total = parts + labor;
  const advance = p.advance ?? 0;
  const remaining = Math.max(0, total - advance);
  return { parts, labor, total, advance, remaining };
}

export function paymentColor(p: Payment): PaymentColor {
  if (p.customFlag) return "custom";
  const { total, advance, remaining } = paymentTotals(p);
  if (total === 0 && advance === 0) return "empty";
  if (remaining === 0 && total > 0) return "paid";
  if (advance > 0 && remaining > 0) return "partial";
  return "debt";
}

export const PAYMENT_COLOR_BG: Record<PaymentColor, string> = {
  paid: "border-emerald-500/60 bg-emerald-500/10",
  partial: "border-amber-500/60 bg-amber-500/10",
  debt: "border-red-500/70 bg-red-500/10",
  custom: "border-purple-500/60 bg-purple-500/10",
  empty: "border-slate-600/60 bg-slate-700/10",
};
