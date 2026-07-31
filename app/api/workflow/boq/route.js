import { readStore, writeStore, addActivity, money } from '../../../../lib/store';
export const runtime = 'nodejs';

// Keyword map so free-text BOQ lines (e.g. "40 bags OPC cement", "TMT steel 2 tonnes")
// resolve to a known catalog line, the way a lightweight BOQ-reader would.
const keywordMap = [
  { match: /cement|opc|ppc/i, id: 'cement-opc' },
  { match: /tmt|steel|rebar|reinforcement/i, id: 'steel-fe500' },
  { match: /m-?sand|river sand|aggregate/i, id: 'msand' },
  { match: /aac|block|brick/i, id: 'aac' },
  { match: /tile|flooring|vitrified/i, id: 'tiles' },
  { match: /plumbing|cpvc|pipe/i, id: 'cpvc' },
  { match: /electrical|wire|cabling/i, id: 'wire' },
  { match: /plywood|ply|laminate/i, id: 'plywood' }
];

function extractQuantity(line) {
  const m = line.match(/(\d[\d,]*)/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

export async function POST(request) {
  const body = await request.json();
  const text = (body.text || '').trim();
  if (!text) return Response.json({ error: 'Paste a BOQ / requirement description or upload a file first.' }, { status: 400 });

  const store = readStore();
  const lines = text.split(/\r?\n|,|;/).map(l => l.trim()).filter(Boolean);
  const found = new Map();

  for (const line of lines) {
    for (const rule of keywordMap) {
      if (rule.match.test(line) && !found.has(rule.id)) {
        const product = store.products.find(p => p.id === rule.id);
        if (product) {
          const qty = extractQuantity(line) || Math.round(20 + Math.random() * 30);
          found.set(rule.id, { ...product, quantity: qty, estimate: qty * product.price, sourceLine: line });
        }
      }
    }
  }

  // whole-document fallback for keywords that never got their own line
  if (found.size === 0) {
    for (const rule of keywordMap) {
      if (rule.match.test(text)) {
        const product = store.products.find(p => p.id === rule.id);
        if (product) {
          const qty = 20;
          found.set(rule.id, { ...product, quantity: qty, estimate: qty * product.price, sourceLine: 'inferred from requirement text' });
        }
      }
    }
  }

  const items = [...found.values()];
  if (items.length === 0) {
    return Response.json({ error: "Couldn't identify recognised materials in that text — try naming categories like cement, steel, sand, tiles, plumbing or electrical." }, { status: 422 });
  }

  const total = items.reduce((a, b) => a + b.estimate, 0);
  const bomId = `BOM-${String(store.rfqs.length + store.orders.length + 1).padStart(4, '0')}`;
  addActivity(store, 'boq', `${bomId} generated from uploaded requirement (${items.length} materials).`, bomId);
  writeStore(store);

  return Response.json({ bomId, items, total: money(total), totalValue: total });
}
