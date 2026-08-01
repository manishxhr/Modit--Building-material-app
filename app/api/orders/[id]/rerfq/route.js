import { addActivity, money, readStore, writeStore } from '../../../../../lib/store';

export const runtime = 'nodejs';

// Prototype workflow: deterministic RFQ regeneration from a prior order.
export async function POST(request, { params }) {
  const { id } = await params;
  const store = readStore();
  const order = store.orders.find((item) => item.id === id);

  if (!order) {
    return Response.json({ error: 'Order not found.' }, { status: 404 });
  }

  const city = order.city || 'Delhi';
  const materials = (order.items || []).map((item) => ({
    name: item.name,
    quantity: `${item.quantity} ${item.unit}`,
    estimate: Number(item.lineTotal || item.quantity * item.price || 0)
  }));

  const base = Number(order.amount || 500000);
  const quotes = store.suppliers
    .filter((supplier) => supplier.city === city || city === 'Delhi NCR')
    .slice(0, 4)
    .map((supplier, index) => ({
      supplierId: supplier.id,
      supplier: supplier.name,
      quote: Math.round(base * (0.92 + index * 0.03)),
      delivery: supplier.delivery,
      rating: supplier.rating,
      reason: index === 0
        ? 'Best continuity from previous project consumption trend.'
        : 'Competitive quote regenerated for repeat procurement.'
    }))
    .sort((a, b) => a.quote - b.quote);

  const rfq = {
    id: `RFQ-${String(store.rfqs.length + 1).padStart(4, '0')}`,
    project: `${order.project} Replenishment`,
    city,
    materials: materials.length > 0 ? materials : [{ name: 'Core construction mix', quantity: '1 lot', estimate: base }],
    status: 'Quotes received',
    quotes,
    createdAt: new Date().toISOString(),
    sourceOrderId: order.id
  };

  store.rfqs.unshift(rfq);
  addActivity(store, 'rfq', `${rfq.id} regenerated from ${order.id}.`, rfq.id);
  writeStore(store);

  return Response.json({
    rfq,
    message: `${rfq.id} regenerated with ${quotes.length} supplier offers for ${money(base)} baseline.`
  }, { status: 201 });
}
