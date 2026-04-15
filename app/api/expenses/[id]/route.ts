import type { NextRequest } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const { description, amount, paid_by, category, date } = await request.json();

  await db.execute({
    sql: `UPDATE expenses SET description = ?, amount = ?, paid_by = ?, category = ?, date = ? WHERE id = ?`,
    args: [
      String(description),
      Number(amount),
      String(paid_by),
      String(category),
      String(date),
      Number(id),
    ],
  });

  return Response.json({ success: true });
}
