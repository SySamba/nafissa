/**
 * Réaligne les séquences PostgreSQL sur MAX(id) après des INSERT avec id explicites
 * (import MySQL → PG). Sans cela le prochain autoincrement réutilise 1… et provoque P2002.
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const TABLES = [
  'categories',
  'users',
  'profiles',
  'services',
  'bookings',
  'payments',
  'notifications_custom',
  'personal_access_tokens',
];

export async function syncPostgresIdSequences(prisma, { log } = {}) {
  for (const table of TABLES) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id), 0)::bigint AS m FROM "${table}"`,
    );
    const m = Number(rows[0].m);
    if (m === 0) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false)`,
      );
    } else {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), ${m}, true)`,
      );
    }
    if (log) console.log(`  séquence "${table}".id → max=${m}`);
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await syncPostgresIdSequences(prisma, { log: true });
    console.log('Séquences synchronisées.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
