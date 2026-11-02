import { Copy, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/context/CRMProvider';
import { mapsLink, wt } from '@/lib/workshop';

export function LocationField({ value, onChange }: { value: string; onChange: (value:string) => void }) {
 const { lang } = useCRM();
 return <div className="space-y-1 text-foreground">
  <label className="text-xs text-muted-foreground" htmlFor="manual-location">{wt(lang,'manualLocation')}</label>
  <div className="flex gap-1">
   <input id="manual-location" aria-label={wt(lang,'manualLocation')} value={value} onChange={e => onChange(e.target.value)} className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
   <Button type="button" variant="outline" size="icon" title={wt(lang,'copy')} aria-label={wt(lang,'copy')} disabled={!value.trim()} onClick={() => void navigator.clipboard.writeText(value).then(() => toast.success(wt(lang,'copied'))).catch(() => toast.error(wt(lang,'failed')))}><Copy className="size-4" /></Button>
   {value.trim() && <Button type="button" variant="outline" size="icon" asChild><a href={mapsLink(value)} target="_blank" rel="noreferrer" title="Google Maps" aria-label="Google Maps"><MapPin className="size-4" /></a></Button>}
  </div>
 </div>;
}