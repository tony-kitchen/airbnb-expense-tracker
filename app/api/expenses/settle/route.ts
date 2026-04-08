import db, { initDb } from '@/lib/db';

export async function POST() {
  await initDb();
  await db.execute('UPDATE expenses SET archived = 1 WHERE archived = 0');
  return Response.json({ success: true });
}
