import { readStore, writeStore, money } from '../../../lib/store';

export const runtime = 'nodejs';

const GST_RATE = 0.18;
const DEFAULT_DELIVERY = 6500;

function summarize(cart) {
  const subtotal = cart.reduce((total, item) => total + item.quantity * item.price, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const delivery = cart.length > 0 ? DEFAULT_DELIVERY : 0;
  const total = subtotal + gst + delivery;
  return {
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    subtotal,
    subtotalLabel: money(subtotal),
    gst,
    gstLabel: money(gst),
    delivery,
    deliveryLabel: money(delivery),
    total,
    totalLabel: money(total)
  };
}

function asLineItem(product, quantity) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unit: product.unit,
    leadTime: product.leadTime,
    price: product.price,
    quantity,
    lineTotal: product.price * quantity,
    lineTotalLabel: money(product.price * quantity)
  };
}

export async function GET() {
  const store = readStore();
  const cart = (store.cart || []).map((item) => ({
    ...item,
    lineTotal: item.quantity * item.price,
    lineTotalLabel: money(item.quantity * item.price)
  }));
  return Response.json({ items: cart, summary: summarize(cart) });
}

export async function POST(request) {
  const body = await request.json();
  const productId = body.productId;
  const quantity = Math.max(1, Number(body.quantity) || 1);

  if (!productId) {
    return Response.json({ error: 'productId is required.' }, { status: 400 });
  }

  const store = readStore();
  const product = store.products.find((item) => item.id === productId);
  if (!product) {
    return Response.json({ error: 'Product not found.' }, { status: 404 });
  }

  const existing = (store.cart || []).find((item) => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    store.cart = store.cart || [];
    store.cart.push(asLineItem(product, quantity));
  }

  writeStore(store);
  return GET();
}

export async function PATCH(request) {
  const body = await request.json();
  const productId = body.productId;
  const quantity = Number(body.quantity);

  if (!productId || Number.isNaN(quantity)) {
    return Response.json({ error: 'productId and quantity are required.' }, { status: 400 });
  }

  const store = readStore();
  const existing = (store.cart || []).find((item) => item.id === productId);
  if (!existing) {
    return Response.json({ error: 'Cart item not found.' }, { status: 404 });
  }

  if (quantity <= 0) {
    store.cart = store.cart.filter((item) => item.id !== productId);
  } else {
    existing.quantity = quantity;
  }

  writeStore(store);
  return GET();
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');

  const store = readStore();
  if (productId) {
    store.cart = (store.cart || []).filter((item) => item.id !== productId);
  } else {
    store.cart = [];
  }

  writeStore(store);
  return GET();
}
