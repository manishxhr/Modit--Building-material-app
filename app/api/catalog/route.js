import { readStore } from '../../../lib/store';
export const runtime='nodejs';
export async function GET(request){const q=new URL(request.url).searchParams.get('q')?.toLowerCase()||'';const products=readStore().products.filter(p=>`${p.name} ${p.category}`.toLowerCase().includes(q));return Response.json(products)}
