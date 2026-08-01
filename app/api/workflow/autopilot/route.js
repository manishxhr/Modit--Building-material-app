import { readStore, writeStore, addActivity, money } from '../../../../lib/store';

export const runtime = 'nodejs';
// Prototype agentic orchestration: deterministic multi-step flow over in-memory workspace data.

function nowIso(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function buildMaterials(areaSqft, projectType) {
  const factor = areaSqft / 1000;
  const materials = [
    { name: 'Cement', quantity: Math.round(factor * 18), unit: 'bags', estimate: Math.round(factor * 18000) },
    { name: 'TMT Steel', quantity: Math.round(factor * 9), unit: 'tonnes', estimate: Math.round(factor * 240000) },
    { name: 'M-Sand & Aggregate', quantity: Math.round(factor * 12), unit: 'm3', estimate: Math.round(factor * 14000) },
    { name: 'AAC Blocks', quantity: Math.round(factor * 1600), unit: 'units', estimate: Math.round(factor * 22000) },
    { name: 'Finishing Package', quantity: Math.round(factor * 5), unit: 'sets', estimate: Math.round(factor * 95000) }
  ];

  if (projectType === 'commercial') {
    materials.splice(3, 0, {
      name: 'Electrical Cabling',
      quantity: Math.round(factor * 6),
      unit: 'bundles',
      estimate: Math.round(factor * 60000)
    });
  }

  return materials;
}

function citySuppliers(store, city) {
  const scoped = store.suppliers.filter((supplier) => !city || supplier.city === city);
  return scoped.length ? scoped : store.suppliers;
}

export async function POST(request) {
  const body = await request.json();
  const store = readStore();

  const project = String(body.project || 'Autopilot Project').trim();
  const projectType = String(body.projectType || 'residential').trim();
  const city = String(body.city || 'Delhi').trim();
  const budget = Math.max(100000, Number(body.budget) || 700000);
  const areaSqft = Math.min(Math.max(Number(body.areaSqft) || 2500, 200), 500000);
  const execute = Boolean(body.execute);

  const materials = buildMaterials(areaSqft, projectType);
  const suppliers = citySuppliers(store, city);
  const quotes = suppliers.slice(0, 4).map((supplier, index) => ({
    supplierId: supplier.id,
    supplier: supplier.name,
    quote: Math.round(budget * (0.9 + index * 0.03)),
    delivery: supplier.delivery,
    rating: supplier.rating
  })).sort((a, b) => a.quote - b.quote);

  const picked = quotes[0];
  const target = Math.round(picked.quote * 0.96);
  const negotiated = Math.max(target, Math.round(picked.quote * 0.93));

  const rfq = {
    id: `RFQ-${String(store.rfqs.length + 1).padStart(4, '0')}`,
    project,
    city,
    materials,
    quotes,
    status: execute ? 'Order confirmed' : 'Negotiation completed',
    createdAt: nowIso()
  };

  store.rfqs.unshift(rfq);

  const timeline = [
    { step: 'Search and shortlist', detail: `${suppliers.length} suppliers scanned for ${city}.`, at: nowIso(0) },
    { step: 'Generate RFQ', detail: `${rfq.id} created with ${materials.length} material groups.`, at: nowIso(3000) },
    { step: 'Compare and negotiate', detail: `${picked.supplier} selected. Negotiated from ${money(picked.quote)} to ${money(negotiated)}.`, at: nowIso(6000) }
  ];

  let order = null;
  if (execute) {
    order = {
      id: `ORD-${String(1001 + store.orders.length).padStart(4, '0')}`,
      project,
      supplier: picked.supplier,
      amount: negotiated,
      status: 'Confirmed',
      eta: `${picked.delivery} hrs`,
      invoice: 'GST invoice draft',
      credit: 'Eligible for 30-day business credit',
      autopilot: true,
      items: materials.map((material) => ({
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        estimate: material.estimate
      })),
      createdAt: nowIso(9000)
    };
    store.orders.unshift(order);
    timeline.push({ step: 'Place order', detail: `${order.id} confirmed with ${picked.supplier}.`, at: nowIso(9000) });
  } else {
    timeline.push({ step: 'Await confirmation', detail: 'Autopilot prepared final offer and is waiting for buyer approval.', at: nowIso(9000) });
  }

  addActivity(store, 'autopilot', `Autopilot run completed for ${project}${order ? ` and placed ${order.id}` : ''}.`, rfq.id);
  writeStore(store);

  return Response.json({
    mode: execute ? 'execute' : 'assist',
    project,
    city,
    rfq,
    pickedSupplier: picked.supplier,
    negotiatedPrice: negotiated,
    timeline,
    order,
    summary: execute
      ? `${order.id} placed via autopilot at ${money(negotiated)}.`
      : `Autopilot prepared negotiated offer ${money(negotiated)} with ${picked.supplier}.`
  }, { status: 201 });
}
