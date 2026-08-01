import { readStore } from '../../../lib/store';
export const runtime = 'nodejs';

function projectPhase(status) {
  if (status === 'Confirmed') return 'Foundation and planning';
  if (status === 'Packed') return 'Structural execution';
  if (status === 'In transit') return 'Core shell execution';
  if (status === 'Delivered') return 'Finishing and MEP continuity';
  return 'Active project';
}

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

  const reorderInsights = s.orders
    .filter((order) => !order.repeatOf)
    .slice(0, 6)
    .map((order, index) => {
      const item = order.items?.[0] || null;
      const currentQty = Number(item?.quantity || 120);
      const dailyBurn = Math.max(6, Math.round(currentQty / 14));
      const phaseBoost = order.status === 'Delivered' ? 4 : order.status === 'In transit' ? 2 : 0;
      const daysLeft = Math.max(2, Math.round(currentQty / dailyBurn) - (index + 2 + phaseBoost));
      const needsReorder = daysLeft <= 7 || order.status === 'Delivered';
      return {
        orderId: order.id,
        project: order.project,
        city: order.city || 'Delhi NCR',
        phase: projectPhase(order.status),
        material: item?.name || 'Core material mix',
        currentQty,
        dailyBurn,
        daysLeft,
        needsReorder,
        threshold: 7,
        suggestedTopUp: Math.max(1, Math.round(currentQty * 0.45)),
        supplier: order.supplier
      };
    });

  return Response.json({
    orders: s.orders,
    rfqs: s.rfqs,
    activity: s.activity,
    suppliers: s.suppliers,
    demandForecast: s.demandForecast,
    leads,
    reorderCandidates,
    reorderAlerts,
    reorderInsights,
    liveTracking,
    generatedAt: new Date().toISOString()
  });
}
