import type { CRMRecord, Lang } from "./types";
import { diffBreakdown, formatBreakdown } from "./duration";

export interface RichDurationData {
  line1: string;
  line2: string;
  totalDays: number;
  urgency: "low" | "medium" | "high" | "critical";
}

export function calculateTempsAttente(
  record: CRMRecord,
  lang: Lang = "fr",
  now: Date = new Date(),
): RichDurationData {
  const end = record.completionDate ?? now.toISOString();
  const b = diffBreakdown(record.createdAt, end);
  const { line1, line2 } = formatBreakdown(b, lang);
  let urgency: RichDurationData["urgency"] = "low";
  if (b.totalDays >= 14) urgency = "critical";
  else if (b.totalDays >= 7) urgency = "high";
  else if (b.totalDays >= 3) urgency = "medium";
  return { line1, line2, totalDays: b.totalDays, urgency };
}
