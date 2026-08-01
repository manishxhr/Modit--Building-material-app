import { readStore } from '../../../lib/store';
export const runtime = 'nodejs';

export async function GET() {
  const s = readStore();
  const leads = s.rfqs.filter(r => r.status !== 'Order confirmed');
  const reorderCandidates = s.orders.filter(o => o.status === 'Delivered' && !o.repeatOf).slice(0, 3);
  const liveTracking = {
    confirmed: s.orders.filter(o => o.status === 'Confirmed').length,
    packed: s.orders.filter(o => o.status === 'Packed').length,
    inTransit: s.orders.filter(o => o.status === 'In transit').length,
    delivered: s.orders.filter(o => o.status === 'Delivered').length
  };

  const reorderAlerts = reorderCandidates.map((order) => ({
    orderId: order.id,
    project: order.project,
    supplier: order.supplier,
    reason: 'Delivered order pattern suggests replenishment window is now open.',
    suggestedTopUp: Math.round(order.amount * 0.4)
  }));

  return Response.json({
    orders: s.orders,
    rfqs: s.rfqs,
    activity: s.activity,
    suppliers: s.suppliers,
    demandForecast: s.demandForecast,
    leads,
    reorderCandidates,
    reorderAlerts,
    liveTracking,
    generatedAt: new Date().toISOString()
  });
}
