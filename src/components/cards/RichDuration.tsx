import type { RichDurationData } from "@/lib/calculateTempsAttente";
import { Clock } from "lucide-react";

const URGENCY_CLASS: Record<RichDurationData["urgency"], string> = {
  low: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  high: "text-orange-300 border-orange-500/40 bg-orange-500/10",
  critical: "text-red-300 border-red-500/50 bg-red-500/15",
};

export function RichDuration({ data }: { data: RichDurationData }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${URGENCY_CLASS[data.urgency]}`}>
      <Clock className="mt-0.5 size-4 shrink-0" />
      <div className="leading-tight">
        <div className="text-sm font-semibold">{data.line1}</div>
        <div className="text-[11px] opacity-80">{data.line2}</div>
      </div>
    </div>
  );
}
