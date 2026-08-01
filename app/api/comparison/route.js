import { readStore } from '../../../lib/store';

export const runtime = 'nodejs';

function estimateUnitPrice(basePrice, supplier) {
  const deliveryFactor = supplier.delivery <= 24 ? 1.04 : supplier.delivery <= 36 ? 1.01 : 0.98;
  const ratingFactor = supplier.rating >= 4.8 ? 1.02 : supplier.rating >= 4.5 ? 1.0 : 0.97;
  const qualityFactor = supplier.quality === 'A+' ? 1.03 : supplier.quality === 'A' ? 1.0 : 0.96;
  return Math.max(1, Math.round(basePrice * deliveryFactor * ratingFactor * qualityFactor));
}

export async function GET(request) {
  const store = readStore();
  const url = new URL(request.url);
  const city = url.searchParams.get('city') || '';
  const category = url.searchParams.get('category') || '';
  const quantity = Math.max(1, Number(url.searchParams.get('quantity')) || 100);

  const products = category
    ? store.products.filter((product) => product.category === category)
    : store.products;

  const basePrice = products.length
    ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
    : 1000;

  const supplierRows = store.suppliers
    .filter((supplier) => !city || supplier.city === city)
    .filter((supplier) => !category || supplier.categories.includes(category))
    .map((supplier) => {
      const unitPrice = estimateUnitPrice(basePrice, supplier);
      const subtotal = unitPrice * quantity;
      const gst = Math.round(subtotal * 0.18);
      const logistics = Math.round(2000 + supplier.delivery * 15);
      const total = subtotal + gst + logistics;
      const speedScore = Math.max(0, 100 - supplier.delivery);
      const qualityScore = supplier.quality === 'A+' ? 100 : supplier.quality === 'A' ? 85 : 70;
      const valueScore = Math.round((Math.max(1, 100 - Math.floor(total / 1000)) + speedScore + qualityScore) / 3);
      return {
        supplierId: supplier.id,
        supplier: supplier.name,
        city: supplier.city,
        quality: supplier.quality,
        rating: supplier.rating,
        deliveryHours: supplier.delivery,
        quantity,
        unitPrice,
        subtotal,
        gst,
        logistics,
        total,
        valueScore,
        aiReason: valueScore > 80
          ? 'Best overall value for timeline-sensitive procurement.'
          : valueScore > 70
            ? 'Balanced quote across quality, cost and lead-time.'
            : 'Use when low-cost sourcing is the primary objective.'
      };
    })
    .sort((a, b) => a.total - b.total);

  const recommended = supplierRows[0] || null;

  return Response.json({
    category: category || 'All categories',
    city: city || 'Delhi NCR',
    quantity,
    basePrice,
    rows: supplierRows,
    recommended
  });
}
