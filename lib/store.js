// This adapter deliberately keeps the demo self-contained and serverless-safe.
// It uses process memory only: there is no filesystem access in a Vercel Function.
// Replace these functions with a Postgres/Prisma repository before public launch.
const seed = {
  products: [
    { id: 'cement-opc', name: 'UltraBuild OPC 43 Cement', category: 'Cement', unit: '50 kg bag', price: 365, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'steel-fe500', name: 'Fe500D TMT Steel', category: 'Steel', unit: 'tonne', price: 72100, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'msand', name: 'Washed M-Sand', category: 'Sand & Aggregate', unit: 'truckload', price: 11200, stock: 'Limited', leadTime: '12 hrs' },
    { id: 'aac', name: 'AAC Blocks 600 x 200 x 200', category: 'Bricks & Blocks', unit: 'piece', price: 92, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'tiles', name: 'Vitrified Floor Tile', category: 'Tiles & Finishes', unit: 'sq ft', price: 74, stock: 'In stock', leadTime: '48 hrs' },
    { id: 'cpvc', name: 'CPVC Plumbing Kit', category: 'Plumbing', unit: 'set', price: 8450, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'wire', name: 'FRLS Electrical Wire', category: 'Electrical', unit: '90 m coil', price: 3290, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'plywood', name: 'BWP Plywood 18 mm', category: 'Plywood & Glass', unit: 'sheet', price: 2860, stock: 'In stock', leadTime: '36 hrs' }
  ],
  suppliers: [
    { id: 1, name: 'MetroBuild Supply', city: 'Gurugram', rating: 4.9, delivery: 24, quality: 'A+', focus: 'Cement, steel & aggregate', status: 'Verified' },
    { id: 2, name: 'NCR Material Hub', city: 'Noida', rating: 4.8, delivery: 36, quality: 'A', focus: 'Bulk contractor pricing', status: 'Verified' },
    { id: 3, name: 'Delhi ProBuild', city: 'Delhi', rating: 4.7, delivery: 48, quality: 'A', focus: 'Finishes & interiors', status: 'Verified' },
    { id: 4, name: 'Axis Construction Exchange', city: 'Faridabad', rating: 4.6, delivery: 30, quality: 'A', focus: 'Multi-site procurement', status: 'Verified' }
  ],
  rfqs: [], orders: [], activity: []
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const globalKey = '__modit_demo_store__';

function state() {
  if (!globalThis[globalKey]) globalThis[globalKey] = clone(seed);
  return globalThis[globalKey];
}

export function readStore() { return clone(state()); }
export function writeStore(store) { globalThis[globalKey] = clone(store); }
export function addActivity(store, type, text, entityId) {
  store.activity.unshift({ id: `act_${Date.now()}`, type, text, entityId, at: new Date().toISOString() });
  store.activity = store.activity.slice(0, 40);
}
export const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;
