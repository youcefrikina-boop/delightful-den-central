import { useEffect } from "react";
import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Bell, CalendarClock } from "lucide-react";

export function AppointmentBadge({ record }: { record: CRMRecord }) {
  const { updateRecord, lang } = useCRM();
  const value = record.appointment;

  // Trigger one notification when within 60 minutes of appointment
  useEffect(() => {
    if (!value || record.appointmentReminded) return;
    const ms = new Date(value).getTime() - Date.now();
    if (ms < 0 || ms > 60 * 60 * 1000) return;
    if (typeof Notification === "undefined") return;
    const fire = () => {
      if (Notification.permission === "granted") {
        new Notification(`📞 ${t(lang, "appointment")} — ${record.client}`, {
          body: `${record.zone}\n${new Date(value).toLocaleString()}`,
        });
        updateRecord(record.id, { appointmentReminded: true });
      }
    };
    const id = setTimeout(fire, Math.max(0, ms - 15 * 60 * 1000));
    return () => clearTimeout(id);
  }, [value, record.appointmentReminded, record.id, record.client, record.zone, lang, updateRecord]);

  function requestNotif() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0d1a2e]/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-300">
        <span className="inline-flex items-center gap-2"><CalendarClock className="size-4" /> {t(lang, "appointment")}</span>
        <button type="button" onClick={requestNotif} title={t(lang, "notifyMe")} className="text-amber-300 hover:text-amber-200">
          <Bell className="size-4" />
        </button>
      </div>
      <input
        type="datetime-local"
        value={value ? value.slice(0, 16) : ""}
        onChange={(e) => updateRecord(record.id, { appointment: e.target.value ? new Date(e.target.value).toISOString() : undefined, appointmentReminded: false })}
        className="w-full rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
      />
      {value && <div className="mt-2 text-xs text-cyan-300">{new Date(value).toLocaleString()}</div>}
    </div>
  );
}
