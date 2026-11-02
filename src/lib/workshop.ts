import type { CRMRecord, Lang } from './types';

const labels: Record<string, [string, string, string]> = {
  manualLocation: ['الموقع: إحداثيات أو عنوان', 'Localisation : coordonnées ou adresse', 'Location: coordinates or address'],
  copy: ['نسخ الموقع', 'Copier la localisation', 'Copy location'],
  copied: ['تم النسخ', 'Copié', 'Copied'],
  failed: ['تعذر الحفظ؛ لم يتم تطبيق التغيير', 'Échec de sauvegarde : modification non appliquée', 'Save failed; change not applied'],
  trash: ['سلة المحذوفات', 'Corbeille', 'Trash bin'],
  permanentDelete: ['حذف نهائي', 'Supprimer définitivement', 'Permanently delete'],
  confirmDelete: ['حذف نهائي؟ لا يمكن استعادة العنصر بعدها.', 'Supprimer définitivement ? Cette action est irréversible.', 'Permanently delete? This cannot be undone.'],
  expenses: ['المصروفات الفعلية', 'Dépenses réelles', 'Actual expenses'],
  profit: ['صافي الربح', 'Bénéfice net', 'Net profit'],
  billed: ['إجمالي الفواتير', 'Total facturé', 'Total billed'],
  paid: ['المقبوضات', 'Encaissements', 'Payments received'],
  debt: ['الديون المتبقية', 'Soldes dus', 'Outstanding debt'],
  accounts: ['حسابات العملاء', 'Comptes clients', 'Client accounts'],
  expenseLogs: ['سجل المصروفات', 'Journal des dépenses', 'Expense logs'],
  parts: ['قطع الغيار', 'Pièces', 'Parts'],
  labor: ['عمالة', 'Main-d’œuvre', 'Labor'],
  amount: ['المبلغ', 'Montant', 'Amount'],
  description: ['الوصف', 'Description', 'Description'],
  date: ['التاريخ', 'Date', 'Date'],
  job: ['التدخل', 'Intervention', 'Job'],
  general: ['مصروف عام', 'Dépense générale', 'General expense'],
  addExpense: ['إضافة مصروف', 'Ajouter une dépense', 'Add expense'],
  addFault: ['إضافة عطل', 'Ajouter une panne', 'Add fault'],
  code: ['رمز الخطأ', 'Code erreur', 'Error code'],
  problem: ['وصف المشكلة', 'Description du problème', 'Problem description'],
  solution: ['الحل المقترح', 'Solution proposée', 'Proposed solution'],
  reference: ['مرجع', 'Référence', 'Reference'],
  allBrands: ['كل الماركات', 'Toutes les marques', 'All brands'],
  allCodes: ['كل الرموز', 'Tous les codes', 'All codes'],
  loading: ['جارٍ التحميل', 'Chargement', 'Loading'],
  retry: ['إعادة المحاولة', 'Réessayer', 'Retry'],
  locationError: ['تعذر التقاط الموقع؛ تحقق من إذن الموقع', 'Localisation indisponible : vérifiez les autorisations', 'Location unavailable; check permissions'],
  newVisit: ['بدء زيارة جديدة', 'Nouvelle visite', 'Start new visit'],
};

export function wt(lang: Lang, key: string) {
  return labels[key]?.[lang === 'ar' ? 0 : lang === 'fr' ? 1 : 2] ?? key;
}

export function enforceWorkflow(record: CRMRecord): CRMRecord {
  return {
    ...record,
    finalState: record.status === 'waiting' ? record.finalState : undefined,
    inDailyPlan: record.status === 'done' ? false : record.inDailyPlan,
    completionDate: record.status === 'done' ? record.completionDate || new Date().toISOString() : record.completionDate,
  };
}

export function nextVisit(records: CRMRecord[], phone: string): number {
  if (!phone.trim()) return 1;
  return Math.max(0, ...records.filter(r => r.phone.trim() === phone.trim()).map(r => r.visitNumber || 1)) + 1;
}

export function renewedIntervention(record: CRMRecord, records: CRMRecord[]): CRMRecord {
  return {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'waiting', finalState: undefined, completionDate: undefined,
    archivedAt: undefined, fieldStatus: undefined, appointment: undefined,
    appointmentReminded: false, diagnosticFinal: '', fault: '', payment: {},
    tasks: [], visits: [], inDailyPlan: false,
    visitNumber: record.phone.trim() ? nextVisit(records, record.phone) : record.visitNumber + 1,
    previousRecordId: record.id,
  };
}

export function locationQuery(record: Pick<CRMRecord, 'manualLocation' | 'gps' | 'zone'>) {
  return record.manualLocation?.trim() || (record.gps ? `${record.gps.lat},${record.gps.lng}` : record.zone);
}

export function mapsLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function financialSummary(accounts: { total_bill: number; amount_paid: number; remaining_debt: number }[], expenses: { amount: number }[]) {
  const revenue = accounts.reduce((sum, a) => sum + Number(a.total_bill), 0);
  const paid = accounts.reduce((sum, a) => sum + Number(a.amount_paid), 0);
  const debt = accounts.reduce((sum, a) => sum + Number(a.remaining_debt), 0);
  const costs = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  return { revenue, paid, debt, costs, profit: revenue - costs };
}