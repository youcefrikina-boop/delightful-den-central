import type { Lang } from "./types";

export interface DurationBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function diffBreakdown(fromIso: string, toIso: string): DurationBreakdown {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  let totalMs = Math.max(0, to.getTime() - from.getTime());
  const totalDays = Math.floor(totalMs / 86_400_000);

  // Calendar-aware breakdown
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) years = 0;
  return { years, months, days, totalDays };
}

const W = {
  ar: { y: "سنة", m: "أشهر", d: "أيام", and: "و", totalDays: "مجموع الأيام" },
  fr: { y: "an", m: "mois", d: "j", and: "et", totalDays: "Total jours" },
  en: { y: "y", m: "mo", d: "d", and: "and", totalDays: "Total days" },
};

export function formatBreakdown(b: DurationBreakdown, lang: Lang): { line1: string; line2: string } {
  const w = W[lang];
  const parts: string[] = [];
  if (b.years) parts.push(`${b.years} ${w.y}`);
  if (b.months) parts.push(`${b.months} ${w.m}`);
  if (b.days || parts.length === 0) parts.push(`${b.days} ${w.d}`);
  const line1 = parts.join(` ${w.and} `);
  const line2 = `${w.totalDays}: ${b.totalDays} ${lang === "ar" ? "يوم" : lang === "fr" ? "jours" : "days"}`;
  return { line1, line2 };
}

export function liveBreakdown(fromIso: string, lang: Lang, toIso?: string) {
  return formatBreakdown(diffBreakdown(fromIso, toIso ?? new Date().toISOString()), lang);
}
