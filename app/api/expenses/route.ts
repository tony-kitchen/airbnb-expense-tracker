import type { NextRequest } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  await initDb();
  const archived = request.nextUrl.searchParams.get('archived') === 'true' ? 1 : 0;

  const result = await db.execute({
    sql: `SELECT id, description, amount, paid_by, category, receipt_url, date, archived, created_at
          FROM expenses
          WHERE archived = ?
          ORDER BY date DESC, id DESC`,
    args: [archived],
  });

  const expenses = result.rows.map((row) => ({
    id: Number(row[0]),
    description: String(row[1]),
    amount: Number(row[2]),
    paid_by: String(row[3]),
    category: String(row[4]),
    receipt_url: row[5] ? String(row[5]) : null,
    date: String(row[6]),
    archived: Number(row[7]),
    created_at: String(row[8]),
  }));

  return Response.json(expenses);
}

export async function DELETE() {
  await initDb();
  await db.execute('DELETE FROM expenses WHERE archived = 1');
  return Response.json({ success: true });
}

export async function POST(request: NextRequest) {
  await initDb();
  const { description, amount, paid_by, category, receipt_url, date } = await request.json();

  const result = await db.execute({
    sql: `INSERT INTO expenses (description, amount, paid_by, category, receipt_url, date)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      String(description),
      Number(amount),
      String(paid_by),
      String(category ?? 'otro'),
      receipt_url ? String(receipt_url) : null,
      String(date),
    ],
  });

  return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
