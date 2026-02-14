
import { db } from '@/lib/db';
export async function GET(){ const items = await db.class.findMany({ orderBy:{createdAt:'desc'} }); return Response.json({items}); }
export async function POST(req:Request){
  const {name} = await req.json();
  const c = await db.class.create({ data:{ name, centerId:(await db.center.findFirst())!.id } });
  return Response.json(c);
}
