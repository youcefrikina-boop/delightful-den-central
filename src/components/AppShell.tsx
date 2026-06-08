import { useEffect, useMemo, useRef, useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { CustomersGrid } from "@/components/tabs/CustomersGrid";
import { QuickEntryForm } from "@/components/tabs/QuickEntryForm";
import { DailySchedule } from "@/components/tabs/DailySchedule";
import { FaultSearch } from "@/components/tabs/FaultSearch";
import { Statistics } from "@/components/tabs/Statistics";
import { Accounting } from "@/components/tabs/Accounting";
import { RadarDispatcher } from "@/components/tabs/RadarDispatcher";
import { ArchivesTimeline } from "@/components/tabs/ArchivesTimeline";
import {
  Wrench, Users, TrendingUp, Clock, Plus, LayoutGrid, List,
  Globe, ChevronDown, UserCircle2, Settings, LogOut, Check,
} from "lucide-react";

type TabKey = "clients" | "schedule" | "radar" | "archives" | "faults" | "stats" | "accounting";

const TABS: { key: TabKey; label: string }[] = [
  { key: "clients", label: "clientManagement" },
  { key: "schedule", label: "tab_schedule" },
  { key: "radar", label: "tab_radar" },
  { key: "archives", label: "tab_archives" },
  { key: "faults", label: "faultsGuide" },
  { key: "stats", label: "statistics" },
  { key: "accounting", label: "accounting" },
];

const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function AppShell() {
  const { records, lang, setLang, userEmail, signOut, technician, setTechnician } = useCRM();
  const [tab, setTab] = useState<TabKey>("clients");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showNew, setShowNew] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [techDraft, setTechDraft] = useState(technician);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTechDraft(technician), [technician]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const kpis = useMemo(() => {
    const today = new Date().toDateString();
    const tasksToday = records.filter((r) => r.appointment && new Date(r.appointment).toDateString() === today).length;
    const waiting = records.filter((r) => r.status === "new" || r.status === "waitingParts" || r.status === "inProgress").length;
    return { total: records.length, tasksToday, waiting };
  }, [records]);

  const currentLang = LANG_OPTIONS.find((l) => l.code === lang) ?? LANG_OPTIONS[0];
  const profileName = (userEmail ?? "").split("@")[0] || t(lang, "profile");

  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundColor: "#0d162d" }}>
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0d162d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-700 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Wrench className="size-5 text-slate-950" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-tight">{t(lang, "appTitle")}</h1>
              <div className="text-[10px] text-slate-400">{t(lang, "appSubtitle")}</div>
            </div>
          </div>

          {/* KPI pills */}
          <div className="flex flex-wrap items-center gap-2 mx-auto">
            <KpiPill icon={<Users className="size-3.5" />} label={t(lang, "totalClients")} value={kpis.total} tone="cyan" />
            <KpiPill icon={<TrendingUp className="size-3.5" />} label={t(lang, "todayTasks")} value={kpis.tasksToday} tone="emerald" />
            <KpiPill icon={<Clock className="size-3.5" />} label={t(lang, "inWaiting")} value={kpis.waiting} tone="amber" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNew((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.45)] hover:from-cyan-300 hover:to-cyan-400"
            >
              <Plus className="size-3.5" />
              {t(lang, "newClient")}
            </button>

            <div className="inline-flex overflow-hidden rounded-lg border border-slate-700">
              <button onClick={() => setView("grid")} aria-label={t(lang, "gridView")}
                className={`grid size-8 place-items-center ${view === "grid" ? "bg-cyan-500/20 text-cyan-300" : "bg-[#0d1a2e] text-slate-400 hover:text-slate-200"}`}>
                <LayoutGrid className="size-4" />
              </button>
              <button onClick={() => setView("list")} aria-label={t(lang, "listView")}
                className={`grid size-8 place-items-center ${view === "list" ? "bg-cyan-500/20 text-cyan-300" : "bg-[#0d1a2e] text-slate-400 hover:text-slate-200"}`}>
                <List className="size-4" />
              </button>
            </div>

            {/* Language dropdown */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => { setLangOpen((v) => !v); setProfileOpen(false); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0a1428] px-2.5 py-2 text-xs text-slate-200 hover:border-cyan-500/50 hover:text-cyan-200"
              >
                <Globe className="size-3.5" />
                <span className="font-medium">{currentLang.label}</span>
                <ChevronDown className={`size-3 transition ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute end-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-slate-700 bg-[#0a1428] shadow-xl">
                  {LANG_OPTIONS.map((opt) => {
                    const active = opt.code === lang;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => { setLang(opt.code); setLangOpen(false); }}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-slate-800 ${active ? "text-cyan-300" : "text-slate-200"}`}
                      >
                        <span className="flex items-center gap-2"><span>{opt.flag}</span>{opt.label}</span>
                        {active && <Check className="size-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setLangOpen(false); }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0a1428] px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-500/50"
              >
                <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[11px] font-bold text-slate-950">
                  {profileName.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden max-w-[120px] truncate font-medium sm:inline">{profileName}</span>
                <ChevronDown className={`size-3 transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute end-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-slate-700 bg-[#0a1428] shadow-xl">
                  <div className="border-b border-slate-800 p-3">
                    <div className="text-xs font-semibold text-slate-100">{profileName}</div>
                    <div className="truncate text-[10px] text-slate-400">{userEmail ?? "—"}</div>
                    {technician && <div className="mt-1 text-[10px] text-cyan-300">{t(lang, "technician")}: {technician}</div>}
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    <Settings className="size-3.5" /> {t(lang, "profileSettings")}
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); void signOut(); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut className="size-3.5" /> {t(lang, "signOut")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUB-HEADER NAV */}
        <nav className="border-t border-slate-800/80">
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3">
            {TABS.map((tDef) => {
              const active = tab === tDef.key;
              return (
                <button
                  key={tDef.key}
                  onClick={() => setTab(tDef.key)}
                  className={`relative whitespace-nowrap px-4 py-3 text-xs font-medium transition ${active ? "text-cyan-300" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {t(lang, tDef.label)}
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5">
        {showNew && (
          <div className="mb-5 rounded-xl border border-cyan-500/30 bg-[#0a1428] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cyan-300">{t(lang, "quickEntry")}</h2>
              <button onClick={() => setShowNew(false)} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <QuickEntryForm />
          </div>
        )}

        {tab === "clients" && <CustomersGrid view={view} onSwitchToList={() => setView("list")} />}
        {tab === "schedule" && <DailySchedule />}
        {tab === "radar" && <RadarDispatcher />}
        {tab === "archives" && <ArchivesTimeline />}
        {tab === "faults" && <FaultSearch />}
        {tab === "stats" && <Statistics />}
        {tab === "accounting" && <Accounting />}
      </main>

      {/* Profile settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0a1428] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <UserCircle2 className="size-4" /> {t(lang, "profileSettings")}
              </h3>
              <button onClick={() => setSettingsOpen(false)} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] text-slate-400">{t(lang, "profile")}</label>
                <input value={userEmail ?? ""} disabled className="w-full rounded-md border border-slate-700 bg-[#060d1f] px-3 py-2 text-sm text-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-400">{t(lang, "technician")}</label>
                <input value={techDraft} onChange={(e) => setTechDraft(e.target.value)} className="w-full rounded-md border border-slate-700 bg-[#060d1f] px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setSettingsOpen(false)} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100">✕</button>
                <button onClick={() => { setTechnician(techDraft); setSettingsOpen(false); }}
                  className="rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400">
                  {t(lang, "save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-[1600px] px-4 pb-6 pt-2 text-center text-[10px] text-slate-600">
        DafaTek CRM — Lovable Cloud
      </footer>
    </div>
  );
}

function KpiPill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "cyan" | "emerald" | "amber" }) {
  const tones = {
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  } as const;
  const dot = {
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
  } as const;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${tones[tone]}`}>
      <span className={`size-1.5 rounded-full ${dot[tone]}`} />
      {icon}<span>{label}</span>
      <span className="ms-1 rounded-full bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-100">{value}</span>
    </div>
  );
}
