import { readStore, writeStore, addActivity, money } from '../../../../../lib/store';
export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { id } = await params;
  const store = readStore();
  const original = store.orders.find(o => o.id === id);
  if (!original) return Response.json({ error: 'Original order not found.' }, { status: 404 });

  // Repeat orders are typically a top-up restock, not a full re-buy.
  const amount = Math.round(original.amount * 0.4);
  const order = {
    id: `ORD-${String(1001 + store.orders.length).padStart(4, '0')}`,
    project: original.project,
    supplier: original.supplier,
    amount,
    status: 'Confirmed',
    eta: original.eta,
    invoice: 'GST invoice draft',
    credit: 'Eligible for 30-day business credit',
    repeatOf: original.id,
    createdAt: new Date().toISOString()
  };
  store.orders.unshift(order);
  addActivity(store, 'reorder', `${order.id} auto-triggered as repeat restock for ${order.project} (from ${original.id}).`, order.id);
  writeStore(store);

  return Response.json({ order, message: `Repeat order placed with ${order.supplier} for ${money(amount)}.` }, { status: 201 });
}
