import type { CRMRecord, Lang, Visit } from "./types";
import { t } from "./i18n";

export function visitLabel(n: number, lang: Lang): string {
  return `${t(lang, "visit")} ${n}`;
}

/** Compute the next visit number for a phone across all records. */
export function nextVisitNumberForPhone(records: CRMRecord[], phone: string, excludeId?: string): number {
  if (!phone.trim()) return 1;
  const same = records.filter((r) => r.phone.trim() === phone.trim() && r.id !== excludeId);
  return same.length + 1;
}

/** Append-only label for inner-visit list (V2, V3, ...). */
export function nextInnerVisitLabel(existing: Visit[], lang: Lang): string {
  return visitLabel(existing.length + 1, lang);
}

/** Previous record (same phone) that has a completionDate, used for healthy run-time. */
export function previousCompletedForPhone(
  records: CRMRecord[],
  record: CRMRecord,
): CRMRecord | null {
  if (!record.phone.trim()) return null;
  const prior = records
    .filter(
      (r) =>
        r.id !== record.id &&
        r.phone.trim() === record.phone.trim() &&
        r.completionDate &&
        new Date(r.completionDate).getTime() < new Date(record.createdAt).getTime(),
    )
    .sort((a, b) => (b.completionDate ?? "").localeCompare(a.completionDate ?? ""));
  return prior[0] ?? null;
}
