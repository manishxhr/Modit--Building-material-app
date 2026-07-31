import { readStore, money } from '../../../../lib/store';
export const runtime = 'nodejs';

const cities = ['Gurugram', 'Noida', 'Delhi', 'Faridabad', 'Ghaziabad', 'Greater Noida'];

export async function POST(request) {
  const body = await request.json();
  const command = (body.command || '').trim();
  if (!command) return Response.json({ error: 'Say or type a command first.' }, { status: 400 });

  const store = readStore();
  const lower = command.toLowerCase();
  const city = cities.find(c => lower.includes(c.toLowerCase()));

  // "reorder <material>" / "restock <material>"
  if (/reorder|restock|repeat/.test(lower)) {
    const last = store.orders[0];
    if (!last) return Response.json({ reply: "You don't have any past orders yet to repeat. Place one through the AI Copilot first.", action: 'none' });
    return Response.json({
      reply: `Got it — I can restock ${last.project} from ${last.supplier} at roughly ${money(Math.round(last.amount * 0.4))}. Confirm on the Orders page to trigger it.`,
      action: 'reorder', orderId: last.id
    });
  }

  // "compare <material> suppliers in <city>" / "find <material> in <city>"
  if (/compare|supplier|vendor|find|quote/.test(lower)) {
    const matches = store.suppliers.filter(s => !city || s.city === city).sort((a, b) => b.rating - a.rating).slice(0, 3);
    return Response.json({
      reply: matches.length
        ? `Top ${city ? city + ' ' : ''}suppliers right now: ${matches.map(m => `${m.name} (★${m.rating}, ${m.delivery}h)`).join(', ')}.`
        : `No suppliers found${city ? ' in ' + city : ''} yet — try another zone.`,
      action: 'compare', matches
    });
  }

  // "track order <id>" / "status of ORD-..."
  const orderMatch = command.match(/ORD-\d+/i);
  if (orderMatch || /track|status/.test(lower)) {
    const order = orderMatch ? store.orders.find(o => o.id.toLowerCase() === orderMatch[0].toLowerCase()) : store.orders[0];
    return Response.json({
      reply: order ? `${order.id} for ${order.project} is currently "${order.status}", ETA ${order.eta}.` : "I couldn't find that order.",
      action: 'track', order
    });
  }

  // default: treat as a material search
  const hits = store.products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(lower.split(' ')[0]));
  return Response.json({
    reply: hits.length
      ? `Found ${hits.length} matching material${hits.length > 1 ? 's' : ''}: ${hits.map(h => `${h.name} — ${money(h.price)}/${h.unit}`).join(', ')}.`
      : `I can help you search materials, compare suppliers by city, track an order, or trigger a reorder — try rephrasing.`,
    action: 'search', hits
  });
}
