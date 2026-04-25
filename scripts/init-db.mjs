import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = createClient({ url });

// Read SQL generated from prisma/schema.prisma at build time
const sql = readFileSync(new URL('../prisma/init.sql', import.meta.url), 'utf8');

// Wrap each statement with IF NOT EXISTS for idempotency
for (const stmt of sql.split(';').map(s => s.trim()).filter(Boolean)) {
  await client.execute(stmt.replace(/CREATE TABLE\b/g, 'CREATE TABLE IF NOT EXISTS'));
}

console.log('Database initialized');
