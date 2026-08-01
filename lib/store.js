// This adapter deliberately keeps the demo self-contained and serverless-safe.
// It uses process memory only: there is no filesystem access in a Vercel Function.
// Replace these functions with a Postgres/Prisma repository before public launch.
const seed = {
  products: [
    { id: 'cement-opc', name: 'UltraBuild OPC 43 Cement', category: 'Cement', unit: '50 kg bag', price: 365, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'steel-fe500', name: 'Fe500D TMT Steel', category: 'Steel', unit: 'tonne', price: 72100, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'msand', name: 'Washed River Sand', category: 'Sand', unit: 'truckload', price: 11200, stock: 'Limited', leadTime: '12 hrs' },
    { id: 'aggregate-20mm', name: '20mm Crushed Aggregate', category: 'Aggregate', unit: 'truckload', price: 9800, stock: 'In stock', leadTime: '18 hrs' },
    { id: 'aac', name: 'AAC Blocks 600 x 200 x 200', category: 'Bricks', unit: 'piece', price: 92, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'tiles', name: 'Vitrified Floor Tile', category: 'Tiles', unit: 'sq ft', price: 74, stock: 'In stock', leadTime: '48 hrs' },
    { id: 'paint-emulsion', name: 'Interior Emulsion Paint', category: 'Paint', unit: '20 L bucket', price: 3890, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'wire', name: 'FRLS Electrical Wire', category: 'Electrical', unit: '90 m coil', price: 3290, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'cpvc', name: 'CPVC Plumbing Kit', category: 'Plumbing', unit: 'set', price: 8450, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'sanitary-basin', name: 'Wall-Mounted Ceramic Basin', category: 'Sanitary', unit: 'piece', price: 2750, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'hardware-fasteners', name: 'Galvanized Fastener Pack', category: 'Hardware', unit: 'box', price: 980, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'glass-toughened', name: 'Toughened Safety Glass', category: 'Glass', unit: 'sq ft', price: 245, stock: 'Made to order', leadTime: '72 hrs' },
    { id: 'wood-timber', name: 'Seasoned Timber Plank', category: 'Wood', unit: 'cft', price: 1850, stock: 'In stock', leadTime: '48 hrs' },
    { id: 'plywood', name: 'BWP Plywood 18 mm', category: 'Plywood', unit: 'sheet', price: 2860, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'roofing-sheet', name: 'PPGI Roofing Sheet', category: 'Roofing', unit: 'sheet', price: 1720, stock: 'In stock', leadTime: '48 hrs' },
    { id: 'tools-drill', name: 'Heavy Duty Rotary Drill', category: 'Tools', unit: 'piece', price: 4590, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'finishing-putty', name: 'Wall Finishing Putty', category: 'Finishing Materials', unit: '20 kg bag', price: 830, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'waterproofing-membrane', name: 'APP Waterproofing Membrane', category: 'Waterproofing', unit: 'roll', price: 3120, stock: 'In stock', leadTime: '36 hrs' },
    { id: 'safety-helmet', name: 'ISI Safety Helmet Kit', category: 'Safety Equipment', unit: 'set', price: 780, stock: 'In stock', leadTime: '24 hrs' },
    { id: 'hvac-duct', name: 'Pre-Insulated HVAC Duct Panel', category: 'HVAC', unit: 'panel', price: 3950, stock: 'In stock', leadTime: '72 hrs' }
  ],
  suppliers: [
    { id: 1, name: 'MetroBuild Supply', city: 'Gurugram', rating: 4.9, delivery: 24, quality: 'A+', focus: 'Cement, steel and structural material', categories: ['Cement', 'Steel', 'Sand', 'Aggregate', 'Safety Equipment'], status: 'Verified' },
    { id: 2, name: 'NCR Material Hub', city: 'Noida', rating: 4.8, delivery: 36, quality: 'A', focus: 'Bulk contractor pricing and core shell packages', categories: ['Cement', 'Bricks', 'Tiles', 'Finishing Materials', 'Waterproofing'], status: 'Verified' },
    { id: 3, name: 'Delhi ProBuild', city: 'Delhi', rating: 4.7, delivery: 48, quality: 'A', focus: 'Finishes, architectural and facade packages', categories: ['Tiles', 'Paint', 'Glass', 'Plywood', 'Wood'], status: 'Verified' },
    { id: 4, name: 'Axis Construction Exchange', city: 'Faridabad', rating: 4.6, delivery: 30, quality: 'A', focus: 'Multi-site procurement and jobsite tools', categories: ['Steel', 'Aggregate', 'Hardware', 'Tools', 'Safety Equipment'], status: 'Verified' },
    { id: 5, name: 'Ghaziabad Build Depot', city: 'Ghaziabad', rating: 4.5, delivery: 40, quality: 'A', focus: 'Warehouse-led MEP and civil supply', categories: ['Cement', 'Bricks', 'Electrical', 'Plumbing', 'Sanitary'], status: 'Verified' },
    { id: 6, name: 'Greater Noida Supply Co.', city: 'Greater Noida', rating: 4.4, delivery: 44, quality: 'B+', focus: 'Township and infrastructure fulfillment', categories: ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Hardware'], status: 'Verified' }
  ],
  demandForecast: [
    { category: 'Cement', change: 18 },
    { category: 'Steel', change: 11 },
    { category: 'Tiles', change: -4 },
    { category: 'Aggregate', change: 7 },
    { category: 'Electrical', change: 9 }
  ],
  rfqs: [
    {
      id: 'RFQ-0001',
      project: 'Dwarka Housing Block C',
      city: 'Delhi',
      materials: [
        { name: 'Cement', quantity: '420 bags', estimate: 153300 },
        { name: 'Steel', quantity: '12 tonnes', estimate: 865200 },
        { name: 'Bricks', quantity: '18000 units', estimate: 165600 }
      ],
      status: 'Quotes received',
      quotes: [
        { supplierId: 1, supplier: 'MetroBuild Supply', quote: 1140000, delivery: 24, rating: 4.9, reason: 'Best balance of price and dispatch.' },
        { supplierId: 5, supplier: 'Ghaziabad Build Depot', quote: 1110000, delivery: 40, rating: 4.5, reason: 'Lower quote with moderate lead time.' }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
    }
  ],
  orders: [
    {
      id: 'ORD-1001',
      project: 'Noida Tech Park Tower A',
      supplier: 'NCR Material Hub',
      amount: 1265400,
      status: 'In transit',
      eta: '16 hrs',
      credit: 'Eligible for 30-day business credit',
      invoice: 'GST invoice draft',
      customerName: 'Arham Constructions',
      paymentMethod: 'PO + Credit',
      city: 'Noida',
      items: [
        { id: 'cement-opc', name: 'UltraBuild OPC 43 Cement', category: 'Cement', quantity: 380, unit: '50 kg bag', price: 365, lineTotal: 138700 },
        { id: 'steel-fe500', name: 'Fe500D TMT Steel', category: 'Steel', quantity: 14, unit: 'tonne', price: 72100, lineTotal: 1009400 },
        { id: 'finishing-putty', name: 'Wall Finishing Putty', category: 'Finishing Materials', quantity: 120, unit: '20 kg bag', price: 830, lineTotal: 99600 }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
    },
    {
      id: 'ORD-1002',
      project: 'Gurugram Residency Phase 2',
      supplier: 'MetroBuild Supply',
      amount: 842300,
      status: 'Delivered',
      eta: 'Delivered',
      credit: 'Prepaid order',
      invoice: 'GST invoice draft',
      customerName: 'KVR Builders',
      paymentMethod: 'UPI',
      city: 'Gurugram',
      items: [
        { id: 'msand', name: 'Washed River Sand', category: 'Sand', quantity: 24, unit: 'truckload', price: 11200, lineTotal: 268800 },
        { id: 'aggregate-20mm', name: '20mm Crushed Aggregate', category: 'Aggregate', quantity: 18, unit: 'truckload', price: 9800, lineTotal: 176400 },
        { id: 'aac', name: 'AAC Blocks 600 x 200 x 200', category: 'Bricks', quantity: 4600, unit: 'piece', price: 92, lineTotal: 423200 }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString()
    },
    {
      id: 'ORD-1003',
      project: 'Faridabad Industrial Shed',
      supplier: 'Axis Construction Exchange',
      amount: 673850,
      status: 'Confirmed',
      eta: '30 hrs',
      credit: 'Prepaid order',
      invoice: 'GST invoice draft',
      customerName: 'SC Infra Projects',
      paymentMethod: 'Bank Transfer',
      city: 'Faridabad',
      items: [
        { id: 'roofing-sheet', name: 'PPGI Roofing Sheet', category: 'Roofing', quantity: 190, unit: 'sheet', price: 1720, lineTotal: 326800 },
        { id: 'tools-drill', name: 'Heavy Duty Rotary Drill', category: 'Tools', quantity: 16, unit: 'piece', price: 4590, lineTotal: 73440 },
        { id: 'safety-helmet', name: 'ISI Safety Helmet Kit', category: 'Safety Equipment', quantity: 120, unit: 'set', price: 780, lineTotal: 93600 }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    }
  ],
  activity: [
    { id: 'act_seed_1', type: 'order', text: 'ORD-1001 dispatched for Noida Tech Park Tower A.', entityId: 'ORD-1001', at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 'act_seed_2', type: 'delivery', text: 'ORD-1002 completed and marked Delivered.', entityId: 'ORD-1002', at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString() },
    { id: 'act_seed_3', type: 'rfq', text: 'RFQ-0001 generated for Dwarka Housing Block C.', entityId: 'RFQ-0001', at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() }
  ],
  cart: []
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
