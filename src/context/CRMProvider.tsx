import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CRMRecord, Lang } from '@/lib/types';
import { nextVisitNumberForPhone } from '@/lib/visitNaming';
import { enforceWorkflow, renewedIntervention, wt } from '@/lib/workshop';
import { supabase } from '@/integrations/supabase/client';
import { fetchRecords, fetchTrashedRecords, fetchSettings, insertRecord, updateRecordCloud, deleteRecordCloud, setRecordDeleted, saveSettings, migrateLocalToCloud } from '@/lib/crmCloud';

interface CRMContextValue {
 records: CRMRecord[]; trashedRecords: CRMRecord[]; userId: string; lang: Lang; technician: string; loading: boolean; userEmail: string | null;
 setLang: (l: Lang) => void; setTechnician: (t: string) => void;
 addRecord: (r: Partial<CRMRecord> & Pick<CRMRecord, 'client'>) => Promise<boolean>;
 updateRecord: (id: string, patch: Partial<CRMRecord>) => Promise<boolean>;
 deleteRecord: (id: string) => Promise<boolean>; restoreDeleted: (id: string) => Promise<boolean>;
 permanentlyDelete: (id: string) => Promise<boolean>; restartVisit: (id: string) => Promise<boolean>;
 signOut: () => Promise<void>;
}
const CRMContext = createContext<CRMContextValue | null>(null);
export function CRMProvider({ userId, userEmail, children }: { userId: string; userEmail: string | null; children: ReactNode }) {
 const [records, setRecords] = useState<CRMRecord[]>([]);
 const [trashedRecords, setTrashedRecords] = useState<CRMRecord[]>([]);
 const [lang, setLangState] = useState<Lang>('ar');
 const [technician, setTechState] = useState('');
 const [loading, setLoading] = useState(true);
 const queryClient = useQueryClient();
 const refreshAccounts = useCallback(() => { void queryClient.invalidateQueries({queryKey:['workshop',userId]}); },[queryClient,userId]);
 useEffect(() => {
  let cancelled = false;
  (async () => {
   try {
    const settings = await fetchSettings(userId);
    if (!settings.migrated_from_local) await migrateLocalToCloud(userId);
    const [fresh,recs,trash] = await Promise.all([fetchSettings(userId),fetchRecords(userId),fetchTrashedRecords(userId)]);
    if (cancelled) return;
    setLangState(fresh.lang); setTechState(fresh.technician); setRecords(recs.map(enforceWorkflow)); setTrashedRecords(trash);
   } catch { toast.error(wt('ar','failed')); }
   finally { if (!cancelled) setLoading(false); }
  })();
  return () => { cancelled = true; };
 },[userId]);
 useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; },[lang]);
 const setLang = useCallback((l:Lang) => { void saveSettings(userId,{lang:l}).then(() => setLangState(l)).catch(() => toast.error(wt(lang,'failed'))); },[userId,lang]);
 const setTechnician = useCallback((tn:string) => { void saveSettings(userId,{technician:tn}).then(() => setTechState(tn)).catch(() => toast.error(wt(lang,'failed'))); },[userId,lang]);
 const failure = useCallback(() => { toast.error(wt(lang,'failed')); return false; },[lang]);
 const addRecord: CRMContextValue['addRecord'] = useCallback(async r => {
  const record = enforceWorkflow({ ...r, id:crypto.randomUUID(), createdAt:r.createdAt ?? new Date().toISOString(), client:r.client, phone:r.phone ?? '', zone:r.zone ?? '', brand:r.brand ?? '', model:r.model ?? '', serviceType:r.serviceType ?? 'boiler', installationLocation:r.installationLocation ?? 'home', status:r.status ?? 'waiting', fault:r.fault ?? '', payment:r.payment ?? {}, tasks:r.tasks ?? [], visits:r.visits ?? [], visitNumber:nextVisitNumberForPhone([...records,...trashedRecords],r.phone ?? ''), inDailyPlan:r.inDailyPlan ?? false });
  try { await insertRecord(userId,record); setRecords(prev => [record,...prev]); refreshAccounts(); return true; } catch { return failure(); }
 },[records,trashedRecords,userId,failure,refreshAccounts]);
 const updateRecord = useCallback(async (id:string,patch:Partial<CRMRecord>) => {
  const old = records.find(r => r.id === id); if (!old) return false;
  const updated = enforceWorkflow({...old,...patch});
  try { await updateRecordCloud(updated); setRecords(prev => prev.map(r => r.id === id ? updated : r)); refreshAccounts(); return true; } catch { return failure(); }
 },[records,failure,refreshAccounts]);
 const deleteRecord = useCallback(async (id:string) => {
  const record = records.find(r => r.id === id); if (!record) return false;
  try { await setRecordDeleted(id,true); setRecords(prev => prev.filter(r => r.id !== id)); setTrashedRecords(prev => [record,...prev]); refreshAccounts(); return true; } catch { return failure(); }
 },[records,failure,refreshAccounts]);
 const restoreDeleted = useCallback(async (id:string) => {
  const record = trashedRecords.find(r => r.id === id); if (!record) return false;
  try { await setRecordDeleted(id,false); setTrashedRecords(prev => prev.filter(r => r.id !== id)); setRecords(prev => [record,...prev]); refreshAccounts(); return true; } catch { return failure(); }
 },[trashedRecords,failure,refreshAccounts]);
 const permanentlyDelete = useCallback(async (id:string) => {
  try { await deleteRecordCloud(id); setTrashedRecords(prev => prev.filter(r => r.id !== id)); refreshAccounts(); return true; } catch { return failure(); }
 },[failure,refreshAccounts]);
 const restartVisit = useCallback(async (id:string) => {
  const record = records.find(r => r.id === id); if (!record || records.some(r => r.previousRecordId === id && r.status === 'waiting')) return false;
  const next = renewedIntervention(record,[...records,...trashedRecords]);
  try { await insertRecord(userId,next); setRecords(prev => [next,...prev]); refreshAccounts(); return true; } catch { return failure(); }
 },[records,trashedRecords,userId,failure,refreshAccounts]);
 const signOut = useCallback(async () => { await supabase.auth.signOut(); queryClient.clear(); },[queryClient]);
 const value = useMemo(() => ({records,trashedRecords,userId,lang,technician,loading,userEmail,setLang,setTechnician,addRecord,updateRecord,deleteRecord,restoreDeleted,permanentlyDelete,restartVisit,signOut}),[records,trashedRecords,userId,lang,technician,loading,userEmail,setLang,setTechnician,addRecord,updateRecord,deleteRecord,restoreDeleted,permanentlyDelete,restartVisit,signOut]);
 return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}
export function useCRM() { const ctx = useContext(CRMContext); if (!ctx) throw new Error('useCRM must be used within CRMProvider'); return ctx; }
