import { useMemo, useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { Calendar, CheckSquare, Clock, AlertCircle, Pencil, Phone, Flame, Hammer, Thermometer, Pipette, Wrench } from "lucide-react";
import type { CRMRecord, ServiceType } from "@/lib/types";

const SERVICE_META: Record<ServiceType, { icon: React.ReactNode; tone: string; bar: string }> = {
  boiler: { icon: <Flame className="size-3.5" />, tone: "text-orange-300 bg-orange-500/15", bar: "bg-orange-500" },
  heating: { icon: <Thermometer className="size-3.5" />, tone: "text-rose-300 bg-rose-500/15", bar: "bg-rose-500" },
  plumbing: { icon: <Pipette className="size-3.5" />, tone: "text-sky-300 bg-sky-500/15", bar: "bg-sky-500" },
  pvc: { icon: <Wrench className="size-3.5" />, tone: "text-purple-300 bg-purple-500/15", bar: "bg-purple-500" },
  gas: { icon: <Flame className="size-3.5" />, tone: "text-amber-300 bg-amber-500/15", bar: "bg-amber-500" },
  handyman: { icon: <Hammer className="size-3.5" />, tone: "text-yellow-300 bg-yellow-500/15", bar: "bg-yellow-500" },
  allWorks: { icon: <Wrench className="size-3.5" />, tone: "text-slate-300 bg-slate-500/15", bar: "bg-slate-500" },
};

export function DailySchedule() {
  const { records, lang, technician, setTechnician } = useCRM();
  const [editTech, setEditTech] = useState(false);

  const data = useMemo(() => {
    const today = new Date().toDateString();
    const todayList = records.filter((r) => r.appointment && new Date(r.appointment).toDateString() === today);
    const waitingList = records.filter((r) => r.status === "waiting");
    return { todayList, waitingList };
  }, [records]);

  const now = new Date();
  const day = now.getDate();
  const monthsAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const weekdaysAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const dateLabel = lang === "ar"
    ? `${weekdaysAr[now.getDay()]}، ${day} ${monthsAr[now.getMonth()]} ${now.getFullYear()}`
    : now.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const techName = technician || "Technicien DafaTek";
  const initials = techName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {/* Date card */}
      <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-gradient-to-l from-cyan-500/10 to-[#0a1428] p-3">
        <div className="grid size-9 place-items-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">{day}</div>
        <div className="text-end">
          <div className="text-[10px] text-cyan-300">{t(lang, "today")}</div>
          <div className="text-sm font-bold text-slate-100">{dateLabel}</div>
        </div>
      </div>

      {/* Technician card */}
      <div className="relative rounded-xl border border-slate-800 bg-[#0a1428] p-3">
        <button
          onClick={() => setEditTech((v) => !v)}
          className="absolute start-3 top-3 grid size-7 place-items-center rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
          aria-label={t(lang, "edit")}
        >
          <Pencil className="size-3.5" />
        </button>
        <div className="flex items-center justify-end gap-3">
          <div className="text-end">
            <div className="text-[10px] text-slate-400">{t(lang, "technicianProfile")}</div>
            {editTech ? (
              <input
                autoFocus
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                onBlur={() => setEditTech(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditTech(false)}
                className="mt-0.5 w-44 rounded-md border border-cyan-500/40 bg-[#0d1a2e] px-2 py-0.5 text-end text-sm font-bold text-slate-100"
              />
            ) : (
              <div className="text-sm font-bold text-slate-100">{techName}</div>
            )}
            <div className="text-[11px] text-cyan-300">Chauffage & Plomberie</div>
            <div className="mt-1 flex items-center justify-end gap-3 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1"><Clock className="size-3" />18:00 — 08:00</span>
              <span className="inline-flex items-center gap-1"><Phone className="size-3" />—</span>
            </div>
          </div>
          <div className="grid size-12 place-items-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">{initials || "DT"}</div>
        </div>
      </div>

      {/* KPI pair */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-center">
          <div className="text-xl font-bold text-amber-300">{data.waitingList.length}</div>
          <div className="text-[11px] text-amber-200/70">{t(lang, "waiting")}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-center">
          <div className="text-xl font-bold text-cyan-300">{data.todayList.length}</div>
          <div className="text-[11px] text-cyan-200/70">{t(lang, "todayInterventions")}</div>
        </div>
      </div>

      {/* Today interventions */}
      <div>
        <div className="mb-2 flex items-center justify-end gap-2 px-1">
          <span className="text-sm font-semibold text-slate-200">{t(lang, "todayInterventions")}</span>
          <span className="grid size-5 place-items-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">{data.todayList.length}</span>
          <Calendar className="size-4 text-cyan-400" />
        </div>
        {data.todayList.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-8 text-center">
            <CheckSquare className="mx-auto size-7 text-slate-600" />
            <div className="mt-2 text-xs text-slate-500">{t(lang, "noTasksToday")}</div>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {data.todayList.map((r) => <ClientRow key={r.id} r={r} />)}
          </ul>
        )}
      </div>

      {/* Waiting */}
      <div>
        <div className="mb-2 flex items-center justify-end gap-2 px-1">
          <span className="text-sm font-semibold text-amber-300">{t(lang, "waiting")}</span>
          <span className="grid size-5 place-items-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">{data.waitingList.length}</span>
          <AlertCircle className="size-4 text-amber-400" />
        </div>
        <ul className="space-y-1.5">
          {data.waitingList.map((r) => <ClientRow key={r.id} r={r} />)}
          {data.waitingList.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">—</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ClientRow({ r }: { r: CRMRecord }) {
  const meta = SERVICE_META[r.serviceType];
  return (
    <li className="relative overflow-hidden rounded-lg bg-[#0d1a2e] py-2 ps-3 pe-2">
      <span className={`absolute inset-y-0 end-0 w-1 ${meta.bar}`} />
      <div className="flex items-center justify-end gap-2">
        <div className="min-w-0 text-end">
          <div className="truncate text-sm font-medium text-slate-100">{r.client}</div>
          <div className="truncate text-[10px] text-slate-500">{r.phone}{r.zone ? ` · ${r.zone}` : ""}</div>
        </div>
        <span className={`grid size-7 place-items-center rounded-md ${meta.tone}`}>{meta.icon}</span>
      </div>
    </li>
  );
}
