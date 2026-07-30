import { readStore } from '../../../lib/store'; export const runtime='nodejs'; export async function GET(){return Response.json(readStore().orders)}
