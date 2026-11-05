import type { CRMRecord, GpsPoint, Lang, Warranty } from './types';

export type EmitterKind = 'aluminium' | 'steel' | 'castIron' | 'underfloor' | 'coil' | 'towel';
export interface InstallationItem { id: string; kind: EmitterKind; material: string; diameter: string; price: number }
export interface ServiceBlock { enabled: boolean; service: string; notes: string; price: number }
export type PaymentState = 'unpaid' | 'partial' | 'settled';
export interface Billing { paid: number; state: PaymentState; paymentDate: string; transactionDate: string }
export interface MaintenanceSubscription {
  contact: { name: string; phone: string; address: string; manualLocation: string; gps?: GpsPoint };
  active: boolean;
  startDate: string;
  items: InstallationItem[];
  underfloorZones: number;
  customMaterials: string[];
  customDiameters: string[];
  sanitary: { heater: string; pipeline: string; recirculation: boolean; installation: string };
  boiler: ServiceBlock & { location: 'home' | 'workshop' };
  heating: ServiceBlock;
  sanitaryNetwork: ServiceBlock;
  paymentMode: string;
  paymentNotes: string;
  billing: Billing;
  warranty: Warranty;
  reminderEnabled: boolean;
  nextMaintenanceDate: string;
  alertDays: number;
}
export function annualDate(date: string) {
  const d = new Date(date); if (Number.isNaN(d.getTime())) return '';
  const month = d.getUTCMonth(); d.setUTCFullYear(d.getUTCFullYear() + 1);
  if (d.getUTCMonth() !== month) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
}
export function createSubscription(r: CRMRecord): MaintenanceSubscription {
  if (r.subscription) {
    const s = structuredClone(r.subscription);
    // Normalize subscriptions saved before prices/billing existed.
    s.items = (s.items ?? []).map(i => ({ ...i, price: i.price ?? 0 }));
    s.underfloorZones = s.underfloorZones ?? 1;
    s.boiler = { ...s.boiler, price: s.boiler.price ?? 0 };
    s.heating = { ...s.heating, price: s.heating.price ?? 0 };
    s.sanitaryNetwork = { ...s.sanitaryNetwork, price: s.sanitaryNetwork.price ?? 0 };
    s.billing = s.billing ?? { paid: 0, state: 'unpaid', paymentDate: '', transactionDate: new Date().toISOString().slice(0, 10) };
    return { ...s, warranty: r.warranty ?? s.warranty, nextMaintenanceDate: r.nextMaintenanceDate ?? s.nextMaintenanceDate, alertDays: r.maintenanceAlertDays ?? s.alertDays };
  }
  return { contact: { name:r.client, phone:r.phone, address:r.zone, manualLocation:r.manualLocation ?? '', gps:r.gps ? {...r.gps} : undefined }, active:true, startDate:new Date().toISOString().slice(0,10), items:[], underfloorZones:1, customMaterials:[], customDiameters:[], sanitary:{heater:'constant',pipeline:'',recirculation:false,installation:'exposed'}, boiler:{enabled:true,location:r.installationLocation === 'workshop' ? 'workshop' : 'home',service:r.boilerAction ?? 'maintenance',notes:'',price:0}, heating:{enabled:false,service:'maintenance',notes:'',price:0}, sanitaryNetwork:{enabled:false,service:'maintenance',notes:'',price:0}, paymentMode:'cash',paymentNotes:'',billing:{paid:0,state:'unpaid',paymentDate:'',transactionDate:new Date().toISOString().slice(0,10)},warranty:structuredClone(r.warranty ?? {status:'out'}), reminderEnabled:true,nextMaintenanceDate:r.nextMaintenanceDate ?? annualDate(r.completionDate ?? r.createdAt),alertDays:r.maintenanceAlertDays ?? 7 };
}
export interface QuoteLine { key: string; qty: number; unitPrice: number; amount: number }
export function quoteSummary(s: MaintenanceSubscription) {
  const equipment: QuoteLine[] = (['aluminium','steel','castIron','underfloor','coil','towel'] as EmitterKind[])
    .map(kind => { const rows = s.items.filter(i => i.kind === kind); return { key: kind, qty: rows.length, unitPrice: rows.length ? rows.reduce((a, i) => a + (i.price || 0), 0) / rows.length : 0, amount: rows.reduce((a, i) => a + (i.price || 0), 0) }; })
    .filter(l => l.qty > 0);
  const services: QuoteLine[] = (['boiler','heating','sanitaryNetwork'] as const)
    .filter(key => s[key].enabled)
    .map(key => ({ key, qty: 1, unitPrice: s[key].price || 0, amount: s[key].price || 0 }));
  const equipmentTotal = equipment.reduce((a, l) => a + l.amount, 0);
  const boilerTotal = s.boiler.enabled ? s.boiler.price || 0 : 0;
  const heatingTotal = s.heating.enabled ? s.heating.price || 0 : 0;
  const sanitaryTotal = s.sanitaryNetwork.enabled ? s.sanitaryNetwork.price || 0 : 0;
  const total = equipmentTotal + boilerTotal + heatingTotal + sanitaryTotal;
  const paid = Math.min(Math.max(s.billing.paid || 0, 0), total);
  return { equipment, services, equipmentTotal, boilerTotal, heatingTotal, sanitaryTotal, total, paid, remaining: total - paid };
}
export function resizeItems(items: InstallationItem[], kind: EmitterKind, change: number) {
  if (change > 0) return [...items,{id:crypto.randomUUID(),kind,material:['aluminium','steel','castIron'].includes(kind) ? kind : '',diameter:'',price:0}];
  let index = -1;
  items.forEach((item, i) => { if (item.kind === kind) index = i; });
  return items.filter((_,i) => i !== index);
}
export function interventionHistory(record: CRMRecord, records: CRMRecord[]) {
  const linked = new Set([record.id]);
  let changed = true;
  while (changed) { changed=false; for (const r of records) if (linked.has(r.id) || (r.previousRecordId && linked.has(r.previousRecordId))) { if (!linked.has(r.id)) {linked.add(r.id);changed=true;} if (r.previousRecordId && !linked.has(r.previousRecordId)) {linked.add(r.previousRecordId);changed=true;} } }
  return records.filter(r => r.id !== record.id && (linked.has(r.id) || (record.phone.trim() && r.phone.trim() === record.phone.trim()))).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}
export function subscriptionPatch(s: MaintenanceSubscription): Partial<CRMRecord> {
  return {subscription:structuredClone(s), warranty:structuredClone(s.warranty),nextMaintenanceDate:s.nextMaintenanceDate,maintenanceAlertDays:s.alertDays};
}
const labels: Record<string,[string,string,string]> = {
  subscription:['الاشتراك','Abonnement','Subscription'], title:['اشتراك الصيانة','Abonnement de maintenance','Maintenance subscription'], contact:['بيانات العميل','Coordonnées client','Customer details'], name:['الاسم','Nom','Name'],phone:['رقم الهاتف','Téléphone','Phone number'],address:['العنوان','Adresse','Address'],gps:['إحداثيات GPS','Coordonnées GPS','GPS coordinates'],location:['الموقع اليدوي','Localisation manuelle','Manual location'],call:['اتصال سريع','Appel rapide','Quick call'],history:['سجل التدخلات السابقة','Historique des interventions','Past intervention history'],empty:['لا توجد تدخلات سابقة','Aucune intervention précédente','No previous interventions'],installation:['معلومات التجهيزات','Informations Installation','Installation information'],aluminium:['مشعات الألمنيوم','Radiateurs aluminium','Aluminium radiators'],steel:['مشعات الفولاذ','Radiateurs acier','Steel radiators'],castIron:['مشعات الحديد الزهر','Radiateurs fonte','Cast iron radiators'],underfloor:['التدفئة الأرضية','Plancher chauffant','Underfloor heating'],coil:['الملف الحراري / السربنتين','Serpentin','Coil / serpentine'],towel:['مجفف المناشف الحراري','Sèche-serviettes','Heated towel rail'],diameter:['قطر الأنبوب','Diamètre du tube','Tube diameter'],material:['المادة','Matériau','Material'],add:['إضافة','Ajouter','Add'],remove:['إنقاص','Réduire','Decrease'],sanitary:['التجهيزات الصحية','Sanitaire','Sanitary'],heater:['نوع سخان الماء','Type de chauffe-eau','Water heater type'],constant:['درجة حرارة ثابتة','Température constante','Constant temperature'],gas:['خزان غاز','Cumulus gaz','Gas cumulus'],electric:['كهربائي','Électrique','Electric'],pipeline:['مادة الأنابيب','Matériau des canalisations','Pipeline material'],recirculation:['حلقة تدوير الماء الساخن المنزلي','Boucle de recirculation ECS','Domestic hot water recirculation'],yes:['نعم','Oui','Yes'],no:['لا','Non','No'],installationType:['نوع التركيب','Type de pose','Installation type'],exposed:['ظاهر','Apparent','Exposed'],concealed:['مدمج','Encastré','Concealed'],boiler:['المرجل','Chaudière','Boiler'],heating:['شبكة التدفئة','Réseau de chauffage','Heating network'],sanitaryNetwork:['الشبكة الصحية','Réseau sanitaire','Sanitary network'],enabled:['مشمول بالاشتراك','Inclus dans l’abonnement','Included in subscription'],home:['المنزل','Domicile','Home'],workshop:['الورشة','Atelier','Workshop'],service:['نوع الخدمة','Type de service','Service type'],maintenance:['صيانة','Entretien','Maintenance'],repair:['إصلاح','Réparation','Repair'],descaling:['إزالة الترسبات','Détartrage','Descaling'],install:['تركيب','Installation','Installation'],notes:['ملاحظات','Notes','Notes'],payment:['طريقة الدفع','Mode de paiement','Payment mode'],cash:['نقداً','Espèces','Cash'],transfer:['تحويل بنكي','Virement bancaire','Bank transfer'],cheque:['شيك','Chèque','Cheque'],card:['بطاقة','Carte','Card'],warranty:['بيانات الضمان','Garantie','Warranty details'],under:['ضمان ساري','Sous garantie','Under warranty'],out:['بدون ضمان','Sans garantie','No warranty'],company:['شركة الضمان','Société','Warranty company'],serial:['الرقم التسلسلي','Numéro de série','Serial number'],start:['تاريخ البداية','Date de début','Start date'],end:['تاريخ النهاية','Date de fin','End date'],reminder:['تذكير الصيانة السنوية','Rappel d’entretien annuel','Annual maintenance reminder'],reminderEnabled:['تفعيل التذكير داخل التطبيق','Activer le rappel dans l’application','Enable in-app reminder'],next:['موعد الصيانة القادمة','Prochain entretien','Next maintenance date'],alert:['التنبيه قبل الموعد (أيام)','Préavis (jours)','Remind before (days)'],active:['اشتراك نشط','Abonnement actif','Active subscription'],paused:['اشتراك متوقف','Abonnement suspendu','Paused subscription'],save:['حفظ الاشتراك','Enregistrer l’abonnement','Save subscription'],close:['إغلاق','Fermer','Close'],saving:['جارٍ الحفظ','Enregistrement','Saving'],saved:['تم حفظ الاشتراك','Abonnement enregistré','Subscription saved'],addOption:['إضافة اختيار','Ajouter une option','Add option'],visit:['زيارة','Visite','Visit'],annual:['بعد سنة','Dans un an','One year later'],due:['حان موعد الصيانة','Entretien à effectuer','Maintenance due'],soon:['اقترب موعد الصيانة','Entretien prochain','Maintenance approaching'],scheduled:['الصيانة مجدولة','Entretien programmé','Maintenance scheduled'],invalidGps:['يرجى إدخال إحداثيات صحيحة','Saisissez des coordonnées valides','Enter valid coordinates'],latitude:['خط العرض','Latitude','Latitude'],longitude:['خط الطول','Longitude','Longitude'],clearGps:['مسح الإحداثيات','Effacer les coordonnées','Clear coordinates']
};
export function st(lang:Lang,key:string) { return labels[key]?.[lang === 'ar' ? 0 : lang === 'fr' ? 1 : 2] ?? key; }