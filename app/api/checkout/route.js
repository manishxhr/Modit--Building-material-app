import { addActivity, money, readStore, writeStore } from '../../../lib/store';

export const runtime = 'nodejs';

const GST_RATE = 0.18;
const DEFAULT_DELIVERY = 6500;

function totals(cart, couponCode) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponCode === 'MODIT5' ? Math.round(subtotal * 0.05) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round(discountedSubtotal * GST_RATE);
  const delivery = cart.length > 0 ? DEFAULT_DELIVERY : 0;
  const total = discountedSubtotal + gst + delivery;
  return { subtotal, discount, gst, delivery, total };
}

function parseLeadHours(leadTime) {
  const m = String(leadTime || '').match(/(\d+)/);
  return m ? Number(m[1]) : 48;
}

export async function POST(request) {
  const body = await request.json();
  const customerName = String(body.customerName || '').trim();
  const phone = String(body.phone || '').trim();
  const address = String(body.address || '').trim() || 'Site address to be confirmed';
  const city = String(body.city || '').trim() || 'Delhi';
  const project = String(body.project || '').trim() || 'General procurement order';
  const paymentMethod = String(body.paymentMethod || 'UPI').trim();
  const couponCode = String(body.couponCode || '').trim().toUpperCase();

  if (!customerName || !phone) {
    return Response.json({ error: 'customerName and phone are required.' }, { status: 400 });
  }

  const store = readStore();
  const cart = store.cart || [];

  if (cart.length === 0) {
    return Response.json({ error: 'Cart is empty. Add products before checkout.' }, { status: 400 });
  }

  const totalsData = totals(cart, couponCode);
  const maxLead = Math.max(...cart.map((item) => parseLeadHours(item.leadTime)));
  const preferredSupplier = store.suppliers
    .filter((supplier) => supplier.city === city || city === '')
    .sort((a, b) => b.rating - a.rating)[0] || store.suppliers[0];

  const order = {
    id: `ORD-${String(1001 + store.orders.length).padStart(4, '0')}`,
    project,
    customerName,
    phone,
    address,
    city,
    supplier: preferredSupplier?.name || 'MODIT Marketplace Fulfilment',
    paymentMethod,
    couponCode: couponCode || null,
    amount: totalsData.total,
    status: 'Confirmed',
    eta: `${maxLead} hrs`,
    credit: paymentMethod === 'PO + Credit' ? 'Eligible for 30-day business credit' : 'Prepaid order',
    invoice: 'GST invoice draft',
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity
    })),
    pricing: {
      subtotal: totalsData.subtotal,
      discount: totalsData.discount,
      gst: totalsData.gst,
      delivery: totalsData.delivery,
      total: totalsData.total
    },
    createdAt: new Date().toISOString()
  };

  store.orders.unshift(order);
  store.cart = [];
  addActivity(store, 'order', `${order.id} placed by ${customerName} (${money(order.amount)}).`, order.id);
  writeStore(store);

  return Response.json({
    order,
    message: `Order placed successfully. ${order.id} confirmed for ${money(order.amount)}.`
  }, { status: 201 });
}
