import { useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCRM } from '@/context/CRMProvider';
import { useWorkshop, type ExpenseEntry } from '@/lib/useWorkshop';
import { supabase } from '@/integrations/supabase/client';
import { financialSummary, wt } from '@/lib/workshop';
import { t } from '@/lib/i18n';

const input='w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
export function Accounting() {
 const { records,lang } = useCRM();
 const { accounts,expenses,isPending,isError,refresh,userId } = useWorkshop();
 const [open,setOpen]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [draft,setDraft]=useState({category:'parts',amount:'',description:'',expense_date:new Date().toISOString().slice(0,10),record_id:''});
 const [busy,setBusy]=useState(false);
 const activeIds = new Set(records.map(r=>r.id));
 const activeAccounts=accounts.filter(a=>!a.deleted_at && activeIds.has(a.record_id));
 const activeExpenses=expenses.filter(e=>!e.deleted_at && (!e.record_id || activeIds.has(e.record_id)));
 const totals=financialSummary(activeAccounts,activeExpenses);
 const money=(n:number)=>`${Number(n).toLocaleString()} ${t(lang,'dzd')}`;
 function edit(expense?:ExpenseEntry) {
  setEditing(expense?.id??null);
  setDraft({category:expense?.category??'parts',amount:expense?String(expense.amount):'',description:expense?.description??'',expense_date:expense?.expense_date??new Date().toISOString().slice(0,10),record_id:expense?.record_id??''}); setOpen(true);
 }
 async function save(e:React.FormEvent) {
  e.preventDefault(); if (busy || !Number.isFinite(Number(draft.amount)) || Number(draft.amount)<=0) return;
  setBusy(true);
  const values={...draft,amount:Number(draft.amount),record_id:draft.record_id||null,owner_id:userId};
  const result=editing?await supabase.from('expense_logs').update(values).eq('id',editing):await supabase.from('expense_logs').insert(values);
  setBusy(false); if(result.error){toast.error(wt(lang,'failed'));return;} await refresh();setOpen(false);
 }
 async function trash(id:string) { const {error}=await supabase.from('expense_logs').update({deleted_at:new Date().toISOString()}).eq('id',id);if(error)toast.error(wt(lang,'failed'));else await refresh(); }
 if(isPending)return <div className="text-muted-foreground">{wt(lang,'loading')}</div>;
 if(isError)return <Button onClick={()=>void refresh()}>{wt(lang,'retry')}</Button>;
 return <div className="crm-controls space-y-6 text-foreground">
  <h2 className="flex items-center gap-2 text-lg font-semibold"><DollarSign className="size-5 text-primary" />{t(lang,'financialSummary')}</h2>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{([['billed',totals.revenue],['paid',totals.paid],['debt',totals.debt],['expenses',totals.costs],['profit',totals.profit]] as const).map(([key,value])=><div key={key} className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{wt(lang,key)}</p><p className={`mt-2 break-words text-xl font-bold ${value<0?'text-destructive':'text-primary'}`}>{money(value)}</p></div>)}</div>
  <section className="space-y-3"><h3 className="font-semibold">{wt(lang,'accounts')}</h3><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-start text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{[t(lang,'client'),wt(lang,'job'),wt(lang,'billed'),wt(lang,'paid'),wt(lang,'debt'),wt(lang,'expenses'),wt(lang,'profit')].map(h=><th key={h} className="p-3 text-start font-medium">{h}</th>)}</tr></thead><tbody>{activeAccounts.map(a=>{const costs=activeExpenses.filter(e=>e.record_id===a.record_id).reduce((s,e)=>s+Number(e.amount),0);const r=records.find(r=>r.id===a.record_id);return <tr key={a.id} className="border-b border-border"><td className="p-3">{a.client_name}</td><td className="p-3">Visite {r?.visitNumber}</td><td className="p-3">{money(a.total_bill)}</td><td className="p-3">{money(a.amount_paid)}</td><td className="p-3">{money(a.remaining_debt)}</td><td className="p-3">{money(costs)}</td><td className="p-3">{money(a.total_bill-costs)}</td></tr>;})}</tbody></table></div>{activeAccounts.length===0&&<p className="text-sm text-muted-foreground">{t(lang,'noResults')}</p>}</section>
  <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{wt(lang,'expenseLogs')}</h3><Button onClick={()=>edit()}><Plus className="size-4" />{wt(lang,'addExpense')}</Button></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{['date','description','job','expenses','amount'].map(key=><th key={key} className="p-3 text-start">{wt(lang,key)}</th>)}<th /></tr></thead><tbody>{activeExpenses.map(e=><tr key={e.id} className="border-b border-border"><td className="p-3">{e.expense_date}</td><td className="p-3">{e.description}</td><td className="p-3">{records.find(r=>r.id===e.record_id)?.client??wt(lang,'general')}</td><td className="p-3">{wt(lang,e.category)}</td><td className="p-3">{money(e.amount)}</td><td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="icon" title={t(lang,'edit')} aria-label={t(lang,'edit')} onClick={()=>edit(e)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" title={t(lang,'delete')} aria-label={t(lang,'delete')} onClick={()=>void trash(e.id)}><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>)}</tbody></table></div>
   {activeExpenses.length===0&&<p className="text-sm text-muted-foreground">{t(lang,'noResults')}</p>}
  </section>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="crm-controls bg-card text-foreground"><DialogHeader><DialogTitle>{wt(lang,'addExpense')}</DialogTitle></DialogHeader><form onSubmit={save} className="space-y-3">
   <label className="block space-y-1"><span>{wt(lang,'amount')}</span><input className={input} type="number" min="0.01" step="0.01" required value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})} /></label>
   <label className="block space-y-1"><span>{wt(lang,'description')}</span><input className={input} required value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} /></label>
   <label className="block space-y-1"><span>{wt(lang,'expenses')}</span><select className={input} value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option value="parts">{wt(lang,'parts')}</option><option value="labor">{wt(lang,'labor')}</option></select></label>
   <label className="block space-y-1"><span>{wt(lang,'date')}</span><input className={input} type="date" required value={draft.expense_date} onChange={e=>setDraft({...draft,expense_date:e.target.value})} /></label>
   <label className="block space-y-1"><span>{wt(lang,'job')}</span><select className={input} value={draft.record_id} onChange={e=>setDraft({...draft,record_id:e.target.value})}><option value="">{wt(lang,'general')}</option>{records.map(r=><option value={r.id} key={r.id}>{r.client} · Visite {r.visitNumber}</option>)}</select></label>
   <Button type="submit" disabled={busy}>{t(lang,'save')}</Button>
  </form></DialogContent></Dialog>
 </div>;
}
