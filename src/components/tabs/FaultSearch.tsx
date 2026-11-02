import { useState } from 'react';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCRM } from '@/context/CRMProvider';
import { useWorkshop, type FaultEntry } from '@/lib/useWorkshop';
import { supabase } from '@/integrations/supabase/client';
import { wt } from '@/lib/workshop';
import { t } from '@/lib/i18n';
const input='w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
export function FaultSearch(){
 const {lang}=useCRM();const {faults,isPending,isError,refresh,userId}=useWorkshop();
 const [brand,setBrand]=useState('');const [code,setCode]=useState('');const [q,setQ]=useState('');
 const [open,setOpen]=useState(false);const [editing,setEditing]=useState<string|null>(null);const [busy,setBusy]=useState(false);
 const [draft,setDraft]=useState({brand:'',code:'',problem:'',cause:'',solution:''});
 const active=faults.filter(f=>!f.deleted_at);
 const brands=Array.from(new Set(active.map(f=>f.brand))).sort();
 const codes=Array.from(new Set(active.filter(f=>!brand||f.brand===brand).map(f=>f.code))).sort();
 const filtered=active.filter(f=>(!brand||f.brand===brand)&&(!code||f.code===code)&&`${f.brand} ${f.code} ${f.problem} ${f.cause} ${f.solution}`.toLowerCase().includes(q.toLowerCase()));
 function edit(f?:FaultEntry){setEditing(f?.id??null);setDraft({brand:f?.brand??'',code:f?.code??'',problem:f?.problem??'',cause:f?.cause??'',solution:f?.solution??''});setOpen(true);}
 async function save(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);const values={...draft,owner_id:userId,updated_at:new Date().toISOString()};const result=editing?await supabase.from('fault_guide').update(values).eq('id',editing):await supabase.from('fault_guide').insert(values);setBusy(false);if(result.error){toast.error(wt(lang,'failed'));return;}await refresh();setOpen(false);}
 async function trash(id:string){const {error}=await supabase.from('fault_guide').update({deleted_at:new Date().toISOString()}).eq('id',id);if(error)toast.error(wt(lang,'failed'));else await refresh();}
 if(isPending)return <p>{wt(lang,'loading')}</p>;if(isError)return <Button onClick={()=>void refresh()}>{wt(lang,'retry')}</Button>;
 return <div className="crm-controls space-y-4 text-foreground">
  <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="size-5 text-primary" />{t(lang,'tab_faults')}</h2><Button onClick={()=>edit()}><Plus className="size-4" />{wt(lang,'addFault')}</Button></div>
  <div className="grid gap-2 sm:grid-cols-3"><input aria-label={t(lang,'search')} className={input} value={q} onChange={e=>setQ(e.target.value)} placeholder={t(lang,'search')} /><select aria-label={t(lang,'brand')} className={input} value={brand} onChange={e=>{setBrand(e.target.value);setCode('');}}><option value="">{wt(lang,'allBrands')}</option>{brands.map(b=><option key={b}>{b}</option>)}</select><select aria-label={wt(lang,'code')} className={input} value={code} onChange={e=>setCode(e.target.value)}><option value="">{wt(lang,'allCodes')}</option>{codes.map(c=><option key={c}>{c}</option>)}</select></div>
  {filtered.length===0&&<p className="py-6 text-center text-muted-foreground">{t(lang,'noResults')}</p>}
  <div className="grid gap-3 md:grid-cols-2">{filtered.map(f=><article key={f.id} className="rounded-lg border border-border bg-card p-4"><header className="flex flex-wrap items-center justify-between gap-2"><strong className="font-mono text-primary">{f.code}</strong><span>{f.brand}</span><div className="flex gap-1">{f.owner_id===userId?<><Button variant="ghost" size="icon" title={t(lang,'edit')} aria-label={t(lang,'edit')} onClick={()=>edit(f)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" title={t(lang,'delete')} aria-label={t(lang,'delete')} onClick={()=>void trash(f.id)}><Trash2 className="size-4 text-destructive" /></Button></>:<span className="text-xs text-muted-foreground">{wt(lang,'reference')}</span>}</div></header><h3 className="mt-3 font-semibold">{f.problem}</h3>{f.cause&&<p className="mt-1 text-sm text-muted-foreground">{f.cause}</p>}<p className="mt-3 border-s-2 border-primary ps-3 text-sm">{f.solution}</p></article>)}</div>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="crm-controls bg-card text-foreground"><DialogHeader><DialogTitle>{wt(lang,'addFault')}</DialogTitle></DialogHeader><form onSubmit={save} className="space-y-3">{(['brand','code','problem','solution'] as const).map(key=><label key={key} className="block space-y-1"><span>{key==='brand'?t(lang,'brand'):wt(lang,key)}</span>{key==='problem'||key==='solution'?<textarea required className={input} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>:<input required className={input} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>}</label>)}<Button type="submit" disabled={busy}>{t(lang,'save')}</Button></form></DialogContent></Dialog>
 </div>;
}
