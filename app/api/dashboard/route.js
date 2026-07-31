import { readStore } from '../../../lib/store';
export const runtime = 'nodejs';

export async function GET() {
  const s = readStore();
  const leads = s.rfqs.filter(r => r.status !== 'Order confirmed');
  const reorderCandidates = s.orders.filter(o => o.status === 'Delivered' && !o.repeatOf).slice(0, 3);
  return Response.json({
    orders: s.orders,
    rfqs: s.rfqs,
    activity: s.activity,
    suppliers: s.suppliers,
    demandForecast: s.demandForecast,
    leads,
    reorderCandidates
  });
}
