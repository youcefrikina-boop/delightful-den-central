import { useState } from 'react';
import { Copy, Crosshair, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/context/CRMProvider';
import { LocationField } from './LocationField';
import { locationQuery, mapsLink, wt } from '@/lib/workshop';
import { t } from '@/lib/i18n';
import type { CRMRecord } from '@/lib/types';
export function GpsButton({record,compact=false}:{record:CRMRecord;compact?:boolean}) {
 const {updateRecord,lang} = useCRM();
 const [busy,setBusy] = useState(false);
 const query = locationQuery(record);
 function capture() {
  if (!navigator.geolocation) { toast.error(wt(lang,'locationError')); return; }
  setBusy(true);
  navigator.geolocation.getCurrentPosition(async pos => {
   await updateRecord(record.id,{gps:{lat:pos.coords.latitude,lng:pos.coords.longitude,capturedAt:new Date().toISOString()},manualLocation:`${pos.coords.latitude},${pos.coords.longitude}`}); setBusy(false);
  },() => { setBusy(false); toast.error(wt(lang,'locationError')); },{enableHighAccuracy:true,timeout:15000});
 }
 return <div className="crm-controls space-y-2">
  {!compact && <LocationField value={record.manualLocation ?? ''} onChange={manualLocation => void updateRecord(record.id,{manualLocation})} />}
  <div className="flex flex-wrap gap-1">
   {!compact && <Button type="button" variant="outline" disabled={busy} onClick={capture}><Crosshair className="size-4" />{t(lang,'gpsCapture')}</Button>}
   {query && <>
    <Button type="button" variant="outline" size={compact?'icon':'default'} asChild><a href={mapsLink(query)} target="_blank" rel="noreferrer" title="Google Maps" aria-label="Google Maps"><MapPin className="size-4" />{!compact && t(lang,'gpsOpen')}</a></Button>
    <Button type="button" variant="outline" size="icon" title={wt(lang,'copy')} aria-label={wt(lang,'copy')} onClick={() => void navigator.clipboard.writeText(query).then(() => toast.success(wt(lang,'copied'))).catch(() => toast.error(wt(lang,'failed')))}><Copy className="size-4" /></Button>
   </>}
  </div>
 </div>;
}
