import { describe, test } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { enforceWorkflow, financialSummary, nextVisit, renewedIntervention, locationQuery, mapsLink, wt } from './workshop';
import type { CRMRecord } from './types';

const record: CRMRecord = { id: 'job1', client: 'Riki', phone: '0555123456', zone: 'Alger', brand: 'Vaillant', model: 'ecoTEC', fault: 'F22 pression basse', diagnosticFinal: 'Vérifier fuite', serviceType: 'boiler', installationLocation: 'home', status: 'waiting', finalState: 'enRoute', createdAt: '2026-10-31T10:22:00Z', payment: { partsCost: 1000, laborCost: 500, advance: 600 }, tasks: [{ id:'task1', text:'Inspecter pompe', done: true }], visits: [], visitNumber: 1, inDailyPlan: true, manualLocation: '36.75, 3.06' };
describe('workshop rules', () => {
  test('completed intervention leaves daily planning and clears final state', () => {
    const done = enforceWorkflow({ ...record, status:'done' });
    strictEqual(done.inDailyPlan, false); strictEqual(done.finalState, undefined); strictEqual(Boolean(done.completionDate), true);
  });
  test('cancelled intervention cannot retain a final state', () => { strictEqual(enforceWorkflow({ ...record, status:'cancelled' }).finalState, undefined); });
  test('waiting intervention retains follow-up stage', () => { strictEqual(enforceWorkflow(record).finalState, 'enRoute'); });
  test('UI language does not mutate fixed input strings', () => {
    const before = structuredClone(record);
    for (const lang of ['ar','fr','en'] as const) { wt(lang,'manualLocation'); enforceWorkflow(record); }
    deepStrictEqual(record, before); strictEqual(record.fault,'F22 pression basse'); strictEqual(record.tasks?.[0].text,'Inspecter pompe');
  });
  test('archive restart moves Visite 1 to Visite 2 without copying billing', () => {
    const done = { ...record, status:'done' as const };
    const visit2 = renewedIntervention(done, [done]);
    strictEqual(visit2.visitNumber,2); strictEqual(visit2.previousRecordId,'job1'); deepStrictEqual(visit2.payment,{}); deepStrictEqual(visit2.tasks,[]); strictEqual(done.payment.advance,600);
  });
  test('counter uses highest historical visit, not record count', () => { strictEqual(nextVisit([record,{...record, id:'job7',visitNumber:7}],record.phone),8); });
  test('new phone starts at visit one', () => { strictEqual(nextVisit([record],'0999999999'),1); });
  test('billed revenue minus actual expenses is net profit', () => {
    deepStrictEqual(financialSummary([{total_bill:1500,amount_paid:600,remaining_debt:900}],[{amount:200},{amount:100}]), {revenue:1500,paid:600,debt:900,costs:300,profit:1200});
  });
  test('manual location takes precedence and maps link is encoded', () => { strictEqual(locationQuery(record),'36.75, 3.06'); strictEqual(mapsLink('36.75, 3.06'),'https://www.google.com/maps/search/?api=1&query=36.75%2C%203.06'); });
});