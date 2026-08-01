import { readStore } from '../../../../lib/store';
export const runtime = 'nodejs';
// Prototype AI matcher: weighted rule-based score using price, delivery, quality, and rating.

const qualityRank = { 'B+': 1, 'A': 2, 'A+': 3 };

function estimateSupplierPrice(basePrice, supplier) {
  const deliveryFactor = supplier.delivery <= 24 ? 1.04 : supplier.delivery <= 36 ? 1.01 : 0.98;
  const ratingFactor = supplier.rating >= 4.8 ? 1.02 : supplier.rating >= 4.5 ? 1.0 : 0.97;
  const qualityFactor = supplier.quality === 'A+' ? 1.03 : supplier.quality === 'A' ? 1.0 : 0.96;
  return Math.max(1, Math.round(basePrice * deliveryFactor * ratingFactor * qualityFactor));
}

export async function POST(request) {
  const body = await request.json();
  const store = readStore();
  const maxLeadTime = Number(body.maxLeadTime) || 72;
  const minQuality = qualityRank[body.quality] || 0;
  const quantity = Math.max(1, Number(body.quantity) || 100);

  const scopedProducts = body.category
    ? store.products.filter((product) => product.category === body.category)
    : store.products;
  const basePrice = scopedProducts.length
    ? Math.round(scopedProducts.reduce((sum, product) => sum + product.price, 0) / scopedProducts.length)
    : 1000;

  let matches = store.suppliers
    .filter(s => !body.city || s.city === body.city)
    .filter(s => !body.category || s.categories.includes(body.category))
    .filter(s => s.delivery <= maxLeadTime)
    .filter(s => (qualityRank[s.quality] || 0) >= minQuality)
    .map(s => {
      const pricePerUnit = estimateSupplierPrice(basePrice, s);
      const expectedTotal = pricePerUnit * quantity;
      const leadScore = Math.max(0, 30 - s.delivery / 2);
      const qualityScore = (qualityRank[s.quality] || 0) * 12;
      const ratingScore = s.rating * 10;
      return { ...s, leadScore, qualityScore, ratingScore, pricePerUnit, expectedTotal };
    })
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  const minPrice = matches[0]?.pricePerUnit || 1;
  const maxPrice = matches[matches.length - 1]?.pricePerUnit || minPrice;

  matches = matches
    .map((supplier) => {
      const priceScore = maxPrice === minPrice
        ? 30
        : Math.round(30 * (1 - (supplier.pricePerUnit - minPrice) / (maxPrice - minPrice)));
      const score = Math.round(supplier.leadScore + supplier.qualityScore + supplier.ratingScore + priceScore);
      return {
        ...supplier,
        priceScore,
        matchScore: Math.min(99, score),
        rationale: `Delivery ${supplier.delivery}h, quality ${supplier.quality}, expected unit price Rs ${supplier.pricePerUnit.toLocaleString('en-IN')}.`
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return Response.json({
    matches,
    criteria: body,
    pricingContext: { basePrice, quantity }
  });
}
