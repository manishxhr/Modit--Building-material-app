import { readStore } from '../../../../lib/store';
export const runtime = 'nodejs';

const qualityRank = { 'B+': 1, 'A': 2, 'A+': 3 };

export async function POST(request) {
  const body = await request.json();
  const store = readStore();
  const maxLeadTime = Number(body.maxLeadTime) || 72;
  const minQuality = qualityRank[body.quality] || 0;

  const matches = store.suppliers
    .filter(s => !body.city || s.city === body.city)
    .filter(s => !body.category || s.categories.includes(body.category))
    .filter(s => s.delivery <= maxLeadTime)
    .filter(s => (qualityRank[s.quality] || 0) >= minQuality)
    .map(s => {
      const leadScore = Math.max(0, 30 - s.delivery / 2);
      const qualityScore = (qualityRank[s.quality] || 0) * 12;
      const ratingScore = s.rating * 10;
      const score = Math.round(leadScore + qualityScore + ratingScore);
      return { ...s, matchScore: Math.min(99, score) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return Response.json({ matches, criteria: body });
}
