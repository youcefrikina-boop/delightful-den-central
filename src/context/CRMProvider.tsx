import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CRMRecord, Lang } from "@/lib/types";
import { nextVisitNumberForPhone } from "@/lib/visitNaming";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchRecords,
  fetchSettings,
  insertRecord,
  updateRecordCloud,
  deleteRecordCloud,
  saveSettings,
  migrateLocalToCloud,
} from "@/lib/crmCloud";

interface CRMContextValue {
  records: CRMRecord[];
  lang: Lang;
  technician: string;
  loading: boolean;
  userEmail: string | null;
  setLang: (l: Lang) => void;
  setTechnician: (t: string) => void;
  addRecord: (r: Partial<CRMRecord> & Pick<CRMRecord, "client">) => void;
  updateRecord: (id: string, patch: Partial<CRMRecord>) => void;
  deleteRecord: (id: string) => void;
  signOut: () => Promise<void>;
}

const CRMContext = createContext<CRMContextValue | null>(null);

export function CRMProvider({
  userId,
  userEmail,
  children,
}: {
  userId: string;
  userEmail: string | null;
  children: ReactNode;
}) {
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [lang, setLangState] = useState<Lang>("ar");
  const [technician, setTechState] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Initial load + one-time migration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await fetchSettings(userId);
        if (!settings.migrated_from_local) {
          await migrateLocalToCloud(userId);
        }
        const fresh = await fetchSettings(userId);
        const recs = await fetchRecords(userId);
        if (cancelled) return;
        setLangState(fresh.lang);
        setTechState(fresh.technician);
        setRecords(recs);
      } catch (e) {
        console.error("CRM load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Sync html dir / lang
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      void saveSettings(userId, { lang: l });
    },
    [userId],
  );

  const setTechnician = useCallback(
    (tn: string) => {
      setTechState(tn);
      void saveSettings(userId, { technician: tn });
    },
    [userId],
  );

  const addRecord: CRMContextValue["addRecord"] = useCallback(
    (r) => {
      const visitNumber = nextVisitNumberForPhone(records, r.phone ?? "");
      const status = r.status ?? "waiting";
      const record: CRMRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completionDate: r.completionDate,
        client: r.client,
        phone: r.phone ?? "",
        zone: r.zone ?? "",
        brand: r.brand ?? "",
        model: r.model ?? "",
        serviceType: r.serviceType ?? "boiler",
        installationLocation: r.installationLocation ?? "home",
        boilerAction: r.boilerAction,
        status,
        finalState: status === "waiting" ? r.finalState : undefined,
        fault: r.fault ?? "",
        diagnosticFinal: r.diagnosticFinal,
        assignedTech: r.assignedTech,
        appointment: r.appointment,
        appointmentReminded: r.appointmentReminded,
        payment: r.payment ?? {},
        warranty: r.warranty,
        tasks: r.tasks ?? [],
        visits: [],
        visitNumber,
        inDailyPlan: r.inDailyPlan ?? false,
        gps: r.gps,
        nextMaintenanceDate: r.nextMaintenanceDate,
        maintenanceAlertDays: r.maintenanceAlertDays,
      };
      setRecords((prev) => [record, ...prev]);
      void insertRecord(userId, record).catch((e) => console.error("insert failed", e));
    },
    [records, userId],
  );

  const updateRecord = useCallback(
    (id: string, patch: Partial<CRMRecord>) => {
      setRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id !== id) return r;
          const merged = { ...r, ...patch };
          // Enforce coupling: finalState only valid when status === "waiting"
          if (merged.status !== "waiting") merged.finalState = undefined;
          return merged;
        });
        const updated = next.find((r) => r.id === id);
        if (updated) void updateRecordCloud(updated).catch((e) => console.error("update failed", e));
        return next;
      });
    },
    [],
  );

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    void deleteRecordCloud(id).catch((e) => console.error("delete failed", e));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      records,
      lang,
      technician,
      loading,
      userEmail,
      setLang,
      setTechnician,
      addRecord,
      updateRecord,
      deleteRecord,
      signOut,
    }),
    [records, lang, technician, loading, userEmail, setLang, setTechnician, addRecord, updateRecord, deleteRecord, signOut],
  );

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error("useCRM must be used within CRMProvider");
  return ctx;
}
