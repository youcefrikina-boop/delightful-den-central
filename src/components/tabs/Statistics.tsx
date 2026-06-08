import { useMemo } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { Home, Building2, Construction, BarChart3, TrendingUp, Wrench, Clock, CheckCircle2, Users, Flame, Hammer, Thermometer, Pipette } from "lucide-react";
import type { ServiceType, InstallationLocation } from "@/lib/types";

const SERVICES: { key: ServiceType; label: string; icon: React.ReactNode; tone: string }[] = [
  { key: "boiler", label: "Chaudière", icon: <Flame className="size-4" />, tone: "text-orange-300" },
  { key: "handyman", label: "Bricolage", icon: <Hammer className="size-4" />, tone: "text-yellow-300" },
  { key: "gas", label: "Gaz", icon: <Flame className="size-4" />, tone: "text-amber-300" },
  { key: "heating", label: "Chauffage", icon: <Thermometer className="size-4" />, tone: "text-rose-300" },
  { key: "plumbing", label: "Plombier", icon: <Pipette className="size-4" />, tone: "text-sky-300" },
];

export function Statistics() {
  const { records, lang } = useCRM();

  const data = useMemo(() => {
    const total = records.length;
    const done = records.filter((r) => r.status === "done").length;
    const inProg = records.filter((r) => r.status === "inProgress" || r.status === "waitingParts" || r.status === "new").length;

    const byLoc = (loc: InstallationLocation) => {
      const list = records.filter((r) => r.installationLocation === loc);
      const d = list.filter((r) => r.status === "done").length;
      return { count: list.length, done: d, rate: list.length ? Math.round((d / list.length) * 100) : 0 };
    };

    const home = byLoc("home");
    const workshop = byLoc("workshop");
    const projects = { count: 0, done: 0, rate: 0 };

    const services = SERVICES.map((s) => {
      const list = records.filter((r) => r.serviceType === s.key);
      const d = list.filter((r) => r.status === "done").length;
      const rate = list.length ? Math.round((d / list.length) * 100) : 0;
      const home = list.filter((r) => r.installationLocation === "home");
      const workshop = list.filter((r) => r.installationLocation === "workshop");
      const homeRate = home.length ? Math.round((home.filter((r) => r.status === "done").length / home.length) * 100) : 0;
      const wsRate = workshop.length ? Math.round((workshop.filter((r) => r.status === "done").length / workshop.length) * 100) : 0;
      return { ...s, count: list.length, done: d, rate, home: { n: home.length, r: homeRate }, workshop: { n: workshop.length, r: wsRate }, projects: { n: 0, r: 0 } };
    });

    return { total, done, inProg, home, workshop, projects, services };
  }, [records]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2.5">
        <div className="text-end">
          <h2 className="text-base font-bold text-emerald-300">{t(lang, "serviceStats")}</h2>
          <div className="text-[11px] text-slate-400">{data.total} {t(lang, "interventions")}</div>
        </div>
        <div className="grid size-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
          <BarChart3 className="size-5" />
        </div>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <LocCard icon={<Construction className="size-4" />} label={t(lang, "projects")} rate={data.projects.rate} count={data.projects.count} done={data.projects.done} tone="amber" />
        <LocCard icon={<Building2 className="size-4" />} label={t(lang, "workshop")} rate={data.workshop.rate} count={data.workshop.count} done={data.workshop.done} tone="emerald" />
        <LocCard icon={<Home className="size-4" />} label={t(lang, "home")} rate={data.home.rate} count={data.home.count} done={data.home.done} tone="cyan" />
      </div>

      {/* Services by location */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3">
        <div className="mb-3 flex items-center justify-end gap-2 px-1">
          <h3 className="text-sm font-semibold text-emerald-300">{t(lang, "serviceByLocation")}</h3>
          <TrendingUp className="size-4 text-emerald-400" />
        </div>
        <div className="space-y-2">
          {data.services.map((s) => (
            <div key={s.key} className="rounded-lg border border-slate-800 bg-[#0d1a2e] p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div className={`text-sm font-bold ${s.tone === "text-emerald-300" ? "text-emerald-300" : s.tone}`}>{s.rate}%</div>
                <div className="flex items-center gap-1.5 text-end">
                  <div>
                    <div className={`text-xs font-bold ${s.tone}`}>{s.label}</div>
                    <div className="text-[10px] text-slate-500">{s.count} {t(lang, "interventions")} · {s.done} {t(lang, "completedShort")}</div>
                  </div>
                  <span className={s.tone}>{s.icon}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <MiniCell value={s.projects.n} rate={s.projects.r} icon="🏗️" />
                <MiniCell value={s.workshop.n} rate={s.workshop.r} icon="🏢" />
                <MiniCell value={s.home.n} rate={s.home.r} icon="🏠" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom KPI bar */}
      <div className="grid grid-cols-4 gap-2">
        <MiniKpi icon={<Wrench className="size-4" />} value={SERVICES.length} label={t(lang, "servicesCount")} tone="text-orange-300 border-orange-500/40" />
        <MiniKpi icon={<Clock className="size-4" />} value={data.inProg} label={t(lang, "inProgressShort")} tone="text-amber-300 border-amber-500/40" />
        <MiniKpi icon={<CheckCircle2 className="size-4" />} value={data.done} label={t(lang, "completedCount")} tone="text-emerald-300 border-emerald-500/40" />
        <MiniKpi icon={<Users className="size-4" />} value={data.total} label={t(lang, "totalInterventions")} tone="text-cyan-300 border-cyan-500/40" />
      </div>
    </div>
  );
}

function LocCard({ icon, label, rate, count, done, tone }: { icon: React.ReactNode; label: string; rate: number; count: number; done: number; tone: "amber" | "emerald" | "cyan" }) {
  const { lang } = useCRM();
  const colors = {
    amber: { text: "text-amber-300", bar: "bg-amber-400" },
    emerald: { text: "text-emerald-300", bar: "bg-emerald-400" },
    cyan: { text: "text-cyan-300", bar: "bg-cyan-400" },
  }[tone];
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a1428] p-3 text-end">
      <div className={`flex items-center justify-end gap-1.5 ${colors.text}`}>
        <span className="text-sm font-bold">{label}</span>
        <span>{icon}</span>
      </div>
      <div className={`mt-0.5 text-lg font-bold ${colors.text}`}>{rate}%</div>
      <div className="text-[10px] text-slate-500">{t(lang, "completionRate")}</div>
      <div className="mt-1 text-xl font-bold text-slate-100">{count}</div>
      <div className="text-[10px] text-slate-500">{done} {t(lang, "completedShort")}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
        <div className={colors.bar} style={{ width: `${rate}%`, height: "100%" }} />
      </div>
    </div>
  );
}

function MiniCell({ value, rate, icon }: { value: number; rate: number; icon: string }) {
  return (
    <div className="rounded-md bg-[#0a1428] py-1.5 text-center">
      <div className="text-sm font-bold text-slate-100">{value}</div>
      <div className="text-[9px] text-slate-500">{rate}% {icon}</div>
    </div>
  );
}

function MiniKpi({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) {
  return (
    <div className={`rounded-xl border bg-[#0a1428] p-2.5 text-center ${tone}`}>
      <div className="flex justify-center">{icon}</div>
      <div className="mt-0.5 text-lg font-bold">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
