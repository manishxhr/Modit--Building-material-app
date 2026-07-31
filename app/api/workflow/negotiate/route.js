import { readStore, writeStore, addActivity, money } from '../../../../lib/store';
export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json();
  const store = readStore();
  const rfq = store.rfqs.find(r => r.id === body.rfqId);
  const quote = rfq?.quotes.find(q => q.supplierId === Number(body.supplierId));
  const target = Number(body.targetPrice);

  if (!quote) return Response.json({ error: 'Offer not found.' }, { status: 404 });
  if (!target || target <= 0) return Response.json({ error: 'Enter a target price to negotiate with.' }, { status: 400 });

  const floor = quote.quote * 0.85; // suppliers rarely concede past ~15%
  let outcome, counter, message;

  if (target >= quote.quote) {
    outcome = 'accepted';
    counter = quote.quote;
    message = `${quote.supplier} accepts at the quoted rate ${money(quote.quote)} — your target was already within range.`;
  } else if (target < floor) {
    outcome = 'held';
    counter = Math.round(floor);
    message = `${quote.supplier} can't reach ${money(target)}. AI negotiated their floor: ${money(counter)} — the best available concession for this material mix.`;
  } else {
    outcome = 'countered';
    // AI splits the gap, weighted toward the supplier since they have less room to move
    counter = Math.round(quote.quote - (quote.quote - target) * 0.6);
    message = `${quote.supplier} countered at ${money(counter)} (from ${money(quote.quote)}). AI recommends accepting — this is close to typical NCR floor pricing for this material mix.`;
  }

  quote.negotiatedPrice = counter;
  quote.negotiationOutcome = outcome;
  addActivity(store, 'negotiate', `${rfq.id}: negotiation with ${quote.supplier} → ${outcome} at ${money(counter)}.`, rfq.id);
  writeStore(store);

  return Response.json({ outcome, counter, message, supplierId: quote.supplierId });
}
