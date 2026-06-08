import { useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import type { CRMRecord } from "@/lib/types";
import { MapPin, Crosshair } from "lucide-react";

export function GpsButton({ record }: { record: CRMRecord }) {
  const { updateRecord, lang } = useCRM();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const link = record.gps
    ? `https://www.google.com/maps/search/?api=1&query=${record.gps.lat},${record.gps.lng}`
    : record.zone
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.zone)}`
    : null;

  function capture() {
    if (!("geolocation" in navigator)) {
      setErr("Geolocation unsupported");
      return;
    }
    setBusy(true);
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateRecord(record.id, {
          gps: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            capturedAt: new Date().toISOString(),
          },
        });
        setBusy(false);
      },
      (e) => {
        setErr(e.message);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={capture}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50"
      >
        <Crosshair className={`size-4 ${busy ? "animate-spin" : ""}`} /> {t(lang, "gpsCapture")}
      </button>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-sm text-slate-200 hover:border-cyan-500/50"
        >
          <MapPin className="size-4" /> {t(lang, "gpsOpen")}
        </a>
      )}
      {record.gps && (
        <span className="self-center text-[10px] text-slate-500">
          {record.gps.lat.toFixed(5)}, {record.gps.lng.toFixed(5)}
        </span>
      )}
      {err && <span className="self-center text-[10px] text-red-300">{err}</span>}
    </div>
  );
}
