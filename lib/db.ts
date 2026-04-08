import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  // Create table with full schema for fresh databases
  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      description  TEXT    NOT NULL,
      amount       REAL    NOT NULL,
      paid_by      TEXT    NOT NULL,
      category     TEXT    NOT NULL DEFAULT 'otro',
      receipt_url  TEXT,
      date         TEXT    NOT NULL,
      archived     INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migrations for existing tables that predate these columns
  try {
    await db.execute("ALTER TABLE expenses ADD COLUMN category TEXT NOT NULL DEFAULT 'otro'");
  } catch {
    // Column already exists — safe to ignore
  }
  try {
    await db.execute('ALTER TABLE expenses ADD COLUMN receipt_url TEXT');
  } catch {
    // Column already exists — safe to ignore
  }
}

export default db;
