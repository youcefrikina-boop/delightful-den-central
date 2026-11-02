import { useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/context/CRMProvider';
import { useWorkshop } from '@/lib/useWorkshop';
import { supabase } from '@/integrations/supabase/client';
import { wt } from '@/lib/workshop';
import { t } from '@/lib/i18n';
export function TrashBin(){
 const {lang,trashedRecords,restoreDeleted,permanentlyDelete}=useCRM();const {faults,expenses,refresh}=useWorkshop();const [busy,setBusy]=useState(false);
 const items=[...trashedRecords.map(r=>({id:r.id,type:'client' as const,name:`${r.client} · Visite ${r.visitNumber}`})),...faults.filter(f=>f.deleted_at).map(f=>({id:f.id,type:'fault' as const,name:`${f.brand} · ${f.code} · ${f.problem}`})),...expenses.filter(e=>e.deleted_at).map(e=>({id:e.id,type:'expense' as const,name:`${e.description} · ${e.amount} ${t(lang,'dzd')}`}))];
 async function act(item:typeof items[number],permanent:boolean){if(permanent&&!window.confirm(wt(lang,'confirmDelete')))return;setBusy(true);try{if(item.type==='client'){if(permanent)await permanentlyDelete(item.id);else await restoreDeleted(item.id);}else{const table=item.type==='fault'?'fault_guide':'expense_logs';const result=permanent?await supabase.from(table).delete().eq('id',item.id).not('deleted_at','is',null):await supabase.from(table).update({deleted_at:null}).eq('id',item.id);if(result.error)throw result.error;await refresh();}}catch{toast.error(wt(lang,'failed'));}finally{setBusy(false);}}
 return <div className="crm-controls space-y-4 text-foreground"><h2 className="flex items-center gap-2 text-lg font-semibold"><Trash2 className="size-5 text-destructive" />{wt(lang,'trash')} <span className="text-sm text-muted-foreground">({items.length})</span></h2>{items.length===0&&<p className="py-8 text-center text-muted-foreground">{t(lang,'noResults')}</p>}<ul className="divide-y divide-border">{items.map(item=><li key={item.type+item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0 flex-1"><span className="text-xs text-muted-foreground">{item.type==='client'?t(lang,'client'):item.type==='fault'?t(lang,'tab_faults'):wt(lang,'expenses')}</span><p className="break-words">{item.name}</p></div><div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={()=>void act(item,false)}><RotateCcw className="size-4" />{t(lang,'restore')}</Button><Button variant="destructive" disabled={busy} onClick={()=>void act(item,true)}><Trash2 className="size-4" />{wt(lang,'permanentDelete')}</Button></div></li>)}</ul></div>;
}
