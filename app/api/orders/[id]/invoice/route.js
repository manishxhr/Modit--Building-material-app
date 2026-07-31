import { readStore } from '../../../../../lib/store';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params;
  const store = readStore();
  const order = store.orders.find(o => o.id === id);
  if (!order) return Response.json({ error: 'Order not found.' }, { status: 404 });

  const taxable = Math.round(order.amount / 1.18);
  const cgst = Math.round(taxable * 0.09);
  const sgst = Math.round(taxable * 0.09);

  return Response.json({
    invoiceNo: `MODIT/GST/${order.id.replace('ORD-', '')}`,
    date: new Date(order.createdAt).toLocaleDateString('en-IN'),
    billTo: order.project,
    supplier: order.supplier,
    taxable,
    cgst,
    sgst,
    total: taxable + cgst + sgst,
    gstin: '07AACCM' + order.id.replace(/\D/g, '').padStart(4, '0') + 'Z5'
  });
}
