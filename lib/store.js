import fs from 'fs';
import path from 'path';

// Vercel and most serverless providers mount the deployment bundle read-only.
// `/tmp` is writable for the lifetime of an invocation container; local runs use
// the repository data folder. Set MODIT_DATA_PATH to a persistent mounted volume.
const file = process.env.MODIT_DATA_PATH || (process.env.VERCEL ? path.join('/tmp', 'modit-store.json') : path.join(process.cwd(), 'data', 'next-store.json'));
let cachedStore;
const seed = {
  products: [
    { id: 'cement-opc', name: 'UltraBuild OPC 43 Cement', category: 'Cement', unit: '50 kg bag', price: 365, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'steel-fe500', name: 'Fe500D TMT Steel', category: 'Steel', unit: 'tonne', price: 72100, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'msand', name: 'Washed M-Sand', category: 'Sand & Aggregate', unit: 'truckload', price: 11200, stock: 'Limited', leadTime: '12 hrs' },
    { id: 'aac', name: 'AAC Blocks 600×200×200', category: 'Bricks & Blocks', unit: 'piece', price: 92, stock: 'In stock', leadTime: '24 hrs' },
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

export function readStore() {
  if (cachedStore) return structuredClone(cachedStore);
  try { cachedStore = { ...seed, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { cachedStore = structuredClone(seed); }
  return structuredClone(cachedStore);
}
export function writeStore(store) {
  cachedStore = structuredClone(store);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
    fs.renameSync(tmp, file);
  } catch (error) {
    // Keep the app usable when a host has no writable filesystem. The cache is
    // deliberately a fallback only; production must set MODIT_DATA_PATH/DB.
    console.warn('MODIT store is running in ephemeral mode:', error.message);
  }
}
export function addActivity(store, type, text, entityId) {
  store.activity.unshift({ id: `act_${Date.now()}`, type, text, entityId, at: new Date().toISOString() });
  store.activity = store.activity.slice(0, 40);
}
export const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;
