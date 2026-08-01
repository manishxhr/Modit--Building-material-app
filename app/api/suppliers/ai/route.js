import { readStore, writeStore, addActivity } from '../../../../lib/store';

export const runtime = 'nodejs';

function ensureOps(store) {
  if (!store.supplierOps) {
    store.supplierOps = {
      inventoryTargets: {},
      pricingMode: {},
      leadStatus: {}
    };
  }
}

function buildSnapshot(store, supplierId) {
  const supplier = store.suppliers.find((item) => item.id === supplierId) || null;
  const openLeads = store.rfqs.filter((rfq) => rfq.status !== 'Order confirmed');
  const relevantLeads = supplier
    ? openLeads.filter((rfq) => rfq.city === supplier.city || !rfq.city)
    : openLeads;

  const inventoryTargets = Object.entries(store.supplierOps.inventoryTargets)
    .filter(([key]) => String(key).startsWith(String(supplierId) + ':'))
    .map(([key, value]) => ({ category: key.split(':')[1], target: value }));

  const leadPipeline = relevantLeads.slice(0, 10).map((lead) => ({
    rfqId: lead.id,
    project: lead.project,
    city: lead.city,
    status: store.supplierOps.leadStatus[lead.id] || 'New lead'
  }));

  return {
    supplier,
    pricingMode: store.supplierOps.pricingMode[supplierId] || 'balanced',
    openLeadCount: relevantLeads.length,
    inventoryTargets,
    leadPipeline,
    demandForecast: store.demandForecast
  };
}

export async function GET(request) {
  const store = readStore();
  ensureOps(store);
  const url = new URL(request.url);
  const supplierId = Number(url.searchParams.get('supplierId')) || store.suppliers[0]?.id;

  if (!supplierId) {
    return Response.json({ error: 'No suppliers available.' }, { status: 404 });
  }

  return Response.json(buildSnapshot(store, supplierId));
}

export async function POST(request) {
  const body = await request.json();
  const store = readStore();
  ensureOps(store);

  const supplierId = Number(body.supplierId);
  if (!supplierId || !store.suppliers.find((item) => item.id === supplierId)) {
    return Response.json({ error: 'Valid supplierId is required.' }, { status: 400 });
  }

  if (body.action === 'updateInventoryTarget') {
    const category = String(body.category || '').trim();
    const target = Math.max(0, Number(body.target) || 0);
    if (!category) return Response.json({ error: 'category is required.' }, { status: 400 });
    store.supplierOps.inventoryTargets[supplierId + ':' + category] = target;
    addActivity(store, 'supplier-ai', `Inventory target updated for ${category} (${target})`, supplierId);
  } else if (body.action === 'updatePricingMode') {
    const mode = String(body.mode || '').trim();
    if (!['aggressive', 'balanced', 'premium'].includes(mode)) {
      return Response.json({ error: 'mode must be aggressive, balanced or premium.' }, { status: 400 });
    }
    store.supplierOps.pricingMode[supplierId] = mode;
    addActivity(store, 'supplier-ai', `Pricing mode switched to ${mode}.`, supplierId);
  } else if (body.action === 'updateLeadStatus') {
    const rfqId = String(body.rfqId || '').trim();
    const status = String(body.status || '').trim();
    if (!rfqId || !status) return Response.json({ error: 'rfqId and status are required.' }, { status: 400 });
    store.supplierOps.leadStatus[rfqId] = status;
    addActivity(store, 'supplier-ai', `Lead ${rfqId} moved to ${status}.`, supplierId);
  } else {
    return Response.json({ error: 'Unsupported action.' }, { status: 400 });
  }

  writeStore(store);
  return Response.json(buildSnapshot(store, supplierId));
}
