import { readStore } from '../../../lib/store';
export const runtime='nodejs';
export async function GET(request){
	const params = new URL(request.url).searchParams;
	const q = params.get('q')?.toLowerCase() || '';
	const category = params.get('category') || '';
	const products = readStore().products
		.filter((product) => !category || product.category === category)
		.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(q));
	return Response.json(products);
}
