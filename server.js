require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const categories = [
  { name: 'Cement & Concrete', icon: '🧱', description: 'OPC, PPC, ready-mix and high-strength concrete blends.' },
  { name: 'Steel & Reinforcement', icon: '🔩', description: 'TMT bars, binding wire, prefabricated reinforcement packages.' },
  { name: 'Sand & Aggregates', icon: '🏗️', description: 'River sand, M-sand, coarse aggregate and crushed stone.' },
  { name: 'Bricks & Blocks', icon: '🧱', description: 'Fly ash bricks, AAC blocks and masonry accessories.' },
  { name: 'Tiles & Finishes', icon: '🪟', description: 'Flooring, wall tiles, sanitary and facade finishing solutions.' },
  { name: 'Electrical & Plumbing', icon: '⚡', description: 'Wires, pipes, fixtures, pumps and complete installation kits.' },
  { name: 'Paint & Coatings', icon: '🎨', description: 'Interior, exterior and waterproofing systems for quick handover.' },
  { name: 'Hardware & Joinery', icon: '🔧', description: 'Door fittings, false ceiling hardware and utility accessories.' },
  { name: 'Plywood & Glass', icon: '🪟', description: 'Commercial plywood, laminates, toughened glass and facade panels.' },
  { name: 'Tools & Equipment', icon: '🛠️', description: 'Power tools, lifting gear and site equipment for rapid execution.' },
];

const suppliers = [
  { id: 1, name: 'MetroBuild Supply', city: 'Gurugram', zone: 'Western NCR', rating: 4.9, delivery: '24 hrs', price: '₹368/50kg bag', stock: 'High', focus: 'Fast-turn prefab and cement', quality: 'A+' },
  { id: 2, name: 'NCR Material Hub', city: 'Noida', zone: 'Eastern NCR', rating: 4.8, delivery: '36 hrs', price: '₹362/50kg bag', stock: 'Medium', focus: 'Bulk contractor pricing', quality: 'A' },
  { id: 3, name: 'Delhi ProBuild', city: 'Delhi', zone: 'Central NCR', rating: 4.7, delivery: '48 hrs', price: '₹370/50kg bag', stock: 'High', focus: 'Architect and retail support', quality: 'A' },
  { id: 4, name: 'Axis Construction Exchange', city: 'Faridabad', zone: 'Southern NCR', rating: 4.6, delivery: '30 hrs', price: '₹365/50kg bag', stock: 'Medium', focus: 'Multi-site procurement', quality: 'A' },
];

const products = [
  { name: 'OPC 43 Grade Cement', category: 'Cement', unit: '50kg bag', price: '₹365', leadTime: '24 hrs' },
  { name: 'TMT Steel Fe500', category: 'Steel', unit: 'ton', price: '₹72,000', leadTime: '36 hrs' },
  { name: 'River Sand', category: 'Sand', unit: 'truck', price: '₹11,200', leadTime: '12 hrs' },
  { name: 'AAC Blocks', category: 'Blocks', unit: 'piece', price: '₹92', leadTime: '18 hrs' },
  { name: 'Premium Sanitary Kit', category: 'Sanitary', unit: 'set', price: '₹18,900', leadTime: '48 hrs' },
  { name: 'Smart Switchgear', category: 'Electrical', unit: 'set', price: '₹8,450', leadTime: '24 hrs' },
];

const projects = [
  { title: 'Luxury Villa', location: 'Gurugram', timeline: '10 weeks', useCase: 'Premium finishing with smart electrical and sanitary packages.' },
  { title: 'Mid-rise Residential', location: 'Noida', timeline: '16 weeks', useCase: 'Rapid procurement for concrete, steel, tiles and plumbing.' },
  { title: 'Commercial Fit-out', location: 'Delhi', timeline: '6 weeks', useCase: 'Fast-moving interior materials and vendor coordination.' },
];

const metrics = [
  { label: 'Suppliers onboarded', value: '1,200+' },
  { label: 'Delhi NCR coverage', value: '18 zones' },
  { label: 'Avg. quote turnaround', value: '12 mins' },
  { label: 'Repeat order rate', value: '72%' },
];

const locations = [
  { city: 'Gurugram', coverage: 'High', focus: 'Luxury villas and quick-turn prefab' },
  { city: 'Noida', coverage: 'High', focus: 'High-rise and commercial procurement' },
  { city: 'Delhi', coverage: 'Medium', focus: 'Retail and interior fit-out' },
  { city: 'Faridabad', coverage: 'High', focus: 'Industrial and large-scale bulk orders' },
  { city: 'Ghaziabad', coverage: 'Medium', focus: 'Warehouse and infrastructure supply' },
  { city: 'Greater Noida', coverage: 'Medium', focus: 'Planned township and builder projects' },
];

const orders = [
  { id: 'ORD-1042', customer: 'Apex Builders', status: 'In transit', amount: '₹4.8L', eta: 'Today' },
  { id: 'ORD-1048', customer: 'Milan Interiors', status: 'Queued for dispatch', amount: '₹1.2L', eta: 'Tomorrow' },
  { id: 'ORD-1061', customer: 'Cityline Estates', status: 'Invoice ready', amount: '₹6.4L', eta: '2 days' },
];

const quoteRequests = [];

function buildRecommendation(projectType, city, budget) {
  const base = [
    { name: 'Cement', reason: 'High structural stability for core construction stages.' },
    { name: 'TMT steel', reason: 'Best for reinforced frames and fast-paced delivery.' },
    { name: 'Tiles & sanitary kit', reason: 'Premium finish planning for a polished handover.' },
  ];

  if (projectType === 'commercial') {
    base.unshift({ name: 'HVAC-ready electrical package', reason: 'Supports high-occupancy fit-out and energy efficiency.' });
  }

  if (budget === 'high') {
    base.push({ name: 'Smart glazing & premium hardware', reason: 'Elevates facade quality and long-term durability.' });
  }

  return {
    city,
    projectType,
    budget,
    materials: base,
    aiNote: 'MODIT pairs your project profile with local suppliers, price bands and delivery confidence to reduce procurement delays.',
  };
}

function buildBoq(projectType, areaSqft, floors) {
  const multiplier = areaSqft / 1000;
  const itemList = [
    { name: 'Cement', quantity: `${Math.round(multiplier * 18)} bags`, estimate: '₹' + (Math.round(multiplier * 18000)).toLocaleString() },
    { name: 'TMT steel', quantity: `${Math.round(multiplier * 9)} tons`, estimate: '₹' + (Math.round(multiplier * 240000)).toLocaleString() },
    { name: 'Sand & aggregate', quantity: `${Math.round(multiplier * 12)} m³`, estimate: '₹' + (Math.round(multiplier * 14000)).toLocaleString() },
    { name: 'Bricks / blocks', quantity: `${Math.round(multiplier * 1600)} units`, estimate: '₹' + (Math.round(multiplier * 22000)).toLocaleString() },
    { name: 'Finishing package', quantity: `${Math.round(multiplier * 5)} sets`, estimate: '₹' + (Math.round(multiplier * 95000)).toLocaleString() },
  ];

  if (projectType === 'commercial') {
    itemList.splice(2, 0, { name: 'Electrical cabling', quantity: `${Math.round(multiplier * 6)} bundles`, estimate: '₹' + (Math.round(multiplier * 60000)).toLocaleString() });
  }

  return {
    projectType,
    areaSqft,
    floors,
    summary: `Estimated BOM for ${areaSqft} sq ft across ${floors} floor(s).`,
    materials: itemList,
  };
}

function buildVendorMatch({ city, budget, delivery, quality }) {
  const normalizedBudget = Number(budget || 500000);
  const normalizedDelivery = Number(delivery || 24);
  const normalizedQuality = quality || 'A';

  return suppliers
    .filter((supplier) => supplier.city.toLowerCase() === city.toLowerCase() || supplier.zone.toLowerCase().includes(city.toLowerCase()))
    .map((supplier) => ({
      ...supplier,
      adjustedQuote: Math.round(normalizedBudget * (0.74 + supplier.id * 0.01)),
      deliveryFit: supplier.delivery.includes('24') || supplier.delivery.includes('30') ? 'Excellent' : 'Good',
      score: Math.round((supplier.rating * 20) - (normalizedDelivery > 24 ? 5 : 0) - (supplier.quality === normalizedQuality ? 3 : 0)),
    }))
    .sort((a, b) => b.score - a.score);
}

app.locals.site = {
  title: 'MODIT',
  tagline: 'AI-first building materials platform for Delhi NCR',
};

app.get('/', (req, res) => {
  res.render('index', {
    categories,
    suppliers,
    projects,
    metrics,
    products,
    locations,
  });
});

app.get('/agentic-ai', (req, res) => {
  res.render('agent', {
    categories,
    suppliers,
    products,
  });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    suppliers,
    orders,
    quoteRequests,
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'modit', timestamp: new Date().toISOString() });
});

app.get('/api/catalog/products', (req, res) => {
  res.json(products);
});

app.get('/api/suppliers/locations', (req, res) => {
  res.json(locations);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/ai/recommendations', (req, res) => {
  const projectType = req.query.projectType || 'residential';
  const city = req.query.city || 'Delhi NCR';
  const budget = req.query.budget || 'medium';

  res.json(buildRecommendation(projectType, city, budget));
});

app.post('/api/ai/boq', (req, res) => {
  const projectType = req.body.projectType || 'residential';
  const areaSqft = Number(req.body.areaSqft || 1800);
  const floors = Number(req.body.floors || 2);

  res.json(buildBoq(projectType, areaSqft, floors));
});

app.post('/api/ai/quote-comparison', (req, res) => {
  const budget = Number(req.body.budget || 4500000);
  const comparison = suppliers.map((supplier) => ({
    ...supplier,
    quote: Math.round(budget * (0.74 + supplier.id * 0.01)),
    confidence: supplier.rating > 4.7 ? 'High' : 'Medium',
  }));

  res.json({ budget, comparison });
});

app.post('/api/ai/vendor-match', (req, res) => {
  const match = buildVendorMatch(req.body);
  res.json({ matches: match.slice(0, 3) });
});

app.post('/api/quote-request', (req, res) => {
  const payload = {
    id: `Q-${quoteRequests.length + 1}`,
    project: req.body.project || 'New build',
    city: req.body.city || 'Gurugram',
    budget: req.body.budget || '₹5L-₹10L',
    delivery: req.body.delivery || 'Within 48 hrs',
    materials: req.body.materials || 'Cement, steel, tiles',
    createdAt: new Date().toISOString(),
  };

  quoteRequests.push(payload);
  res.json({
    message: 'Bulk quotation request captured and routed to MODIT AI negotiators.',
    request: payload,
  });
});

app.post('/api/agent/assistant', (req, res) => {
  const intent = req.body.intent || 'search';
  const location = req.body.location || 'Gurugram';
  const voice = req.body.voice || 'Order cement and steel for the next site visit';

  const actions = [
    `Locate the best ${intent} partner near ${location}`,
    'Compare quote, delivery and quality scores in real time',
    'Generate a draft purchase order, GST invoice and BNPL workflow',
    `Trigger a smart reorder reminder for ${voice}`,
  ];

  res.json({
    intent,
    location,
    response: 'MODIT Agentic AI has prepared a procurement and delivery sequence for your site team.',
    actions,
  });
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MODIT server running on http://localhost:${PORT}`);
});
