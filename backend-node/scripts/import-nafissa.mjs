/**
 * Importe le dump MySQL `nafissa.sql` (phpMyAdmin) vers PostgreSQL (schéma Prisma).
 *
 * Usage (depuis le dossier backend-node) :
 *   node scripts/import-nafissa.mjs
 *   node scripts/import-nafissa.mjs "C:\\chemin\\vers\\nafissa.sql"
 *
 * Efface les données métier (TRUNCATE … CASCADE) puis réinsère en conservant les IDs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { syncPostgresIdSequences } from './sync-postgres-id-sequences.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DUMP = path.join(__dirname, '..', '..', 'nafissa.sql');

const IMPORT_ORDER = [
  'categories',
  'users',
  'profiles',
  'services',
  'bookings',
  'payments',
  'notifications_custom',
  'personal_access_tokens',
];

const ALLOWED = new Set(IMPORT_ORDER);

function scanMysqlString(raw, start) {
  let i = start + 1;
  let buf = '';
  while (i < raw.length) {
    const c = raw[i];
    if (c === "'" && raw[i + 1] === "'") {
      buf += "'";
      i += 2;
      continue;
    }
    if (c === '\\') {
      i++;
      if (i >= raw.length) break;
      const n = raw[i];
      if (n === 'n') buf += '\n';
      else if (n === 'r') buf += '\r';
      else if (n === 't') buf += '\t';
      else if (n === '\\') buf += '\\';
      else if (n === "'" || n === '"' || n === '`') buf += n;
      else buf += n;
      i++;
      continue;
    }
    if (c === "'") return { end: i + 1, value: buf };
    buf += c;
    i++;
  }
  throw new Error('Chaîne MySQL non fermée');
}

function lexMysqlValues(fragment) {
  const tokens = [];
  let i = 0;
  while (i < fragment.length) {
    while (/\s/.test(fragment[i])) i++;
    if (i >= fragment.length) break;
    const c = fragment[i];
    if (c === '(') {
      tokens.push({ t: '(' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ t: ')' });
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ t: ',' });
      i++;
      continue;
    }
    if (c === 'N' && fragment.slice(i, i + 4) === 'NULL') {
      tokens.push({ t: 'NULL' });
      i += 4;
      continue;
    }
    if (c === '-' || (c >= '0' && c <= '9')) {
      const m = /^-?\d+(?:\.\d+)?/.exec(fragment.slice(i));
      if (m) {
        tokens.push({ t: 'NUMBER', raw: m[0] });
        i += m[0].length;
        continue;
      }
    }
    if (c === "'") {
      const { end, value } = scanMysqlString(fragment, i);
      tokens.push({ t: 'STRING', value });
      i = end;
      continue;
    }
    throw new Error(`Token inattendu [${i}]: ${fragment.slice(i, i + 50)}`);
  }
  return tokens;
}

function parseRows(valuesFragment) {
  const tokens = lexMysqlValues(valuesFragment);
  const rows = [];
  let ix = 0;
  const expect = (want) => {
    if (!tokens[ix] || tokens[ix].t !== want) {
      throw new Error(`Lex attend ${want}, obtenu ${tokens[ix]?.t}`);
    }
    ix++;
  };
  while (ix < tokens.length) {
    expect('(');
    const row = [];
    while (true) {
      const tok = tokens[ix++];
      if (tok.t === 'NULL') row.push(null);
      else if (tok.t === 'NUMBER') row.push(tok.raw);
      else if (tok.t === 'STRING') row.push(tok.value);
      else throw new Error(`Valeur invalide: ${tok?.t}`);
      const sep = tokens[ix++];
      if (sep?.t === ')') break;
      if (sep?.t !== ',') throw new Error('Attendu , ou )');
    }
    rows.push(row);
    if (ix < tokens.length) expect(',');
  }
  return rows;
}

function findSemicolonAfterValues(sql, valuesPos) {
  let vi = sql.indexOf('VALUES', valuesPos);
  if (vi === -1) return -1;
  vi += 'VALUES'.length;
  while (/\s/.test(sql[vi])) vi++;
  if (sql[vi] !== '(') return -1;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let i = vi;
  for (; i < sql.length; i++) {
    const ch = sql[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === '\\') {
        esc = true;
        continue;
      }
      if (ch === "'" && sql[i + 1] === "'") {
        i++;
        continue;
      }
      if (ch === "'") inStr = false;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) return i;
  }
  return -1;
}

function extractOrderedBlocks(fullSql) {
  const blocks = [];
  let from = 0;
  while (from < fullSql.length) {
    const hi = fullSql.indexOf('INSERT INTO `', from);
    if (hi === -1) break;
    const tblStart = hi + 'INSERT INTO `'.length;
    const te = fullSql.indexOf('`', tblStart);
    const table = fullSql.slice(tblStart, te);
    if (!ALLOWED.has(table)) {
      from = te + 1;
      continue;
    }
    const semi = findSemicolonAfterValues(fullSql, hi);
    if (semi === -1) throw new Error(`Pas de ';' fermant pour INSERT ${table}`);
    const valuesPos = fullSql.indexOf('VALUES', hi);
    const valuesHeaderEnd = valuesPos + 'VALUES'.length;
    let i = valuesHeaderEnd;
    while (/\s/.test(fullSql[i])) i++;
    const fragment = fullSql.slice(i, semi).trim(); // (...),(...)
    blocks.push({
      table,
      headerSlice: fullSql.slice(hi, valuesPos),
      valuesFragment: fragment,
    });
    from = semi + 1;
  }
  /** Garde uniquement première occurrence si doublons (réexport) */
  const seen = new Set();
  const dedup = [];
  for (const b of blocks) {
    const k = `${b.table}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(b);
  }
  return IMPORT_ORDER.flatMap((t) => dedup.filter((x) => x.table === t));
}

function pgQuoteIdent(name) {
  if (name === 'read') return '"read"';
  return '"' + name.replace(/"/g, '""') + '"';
}

function pgLit(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function extractColumns(headerSlice) {
  const k = headerSlice.indexOf(' (');
  if (k === -1) throw new Error('Liste de colonnes: « INSERT … ` (« introuvable.');
  /** ` … ` (`col1` — k pointe sur l’espace avant `(` */
  const innerStart = k + 3;
  const close = headerSlice.lastIndexOf('`)');
  if (close <= innerStart) throw new Error('Fin de liste de colonnes « `) » introuvable.');
  const inner = headerSlice.slice(innerStart, close);
  return inner
    .split(',')
    .map((c) => c.replace(/`/g, '').trim())
    .filter(Boolean);
}

function sqlBoolTiny(v) {
  if (v === null) return 'NULL';
  const s = String(v);
  if (s === '1' || s === 'true') return 'TRUE';
  if (s === '0' || s === 'false') return 'FALSE';
  throw new Error(`Bool tinyint non reconnu: ${v}`);
}

function coerce(table, col, val) {
  if (val === null) return 'NULL';
  if (table === 'categories' && col === 'active') return sqlBoolTiny(val);
  if (table === 'users' && col === 'verified') return sqlBoolTiny(val);
  if (table === 'services' && col === 'available') return sqlBoolTiny(val);
  if (table === 'notifications_custom' && col === 'read') return sqlBoolTiny(val);
  if (table === 'personal_access_tokens' && col === 'abilities' && typeof val === 'string') {
    /** Après lex MySQL souvent "[*]" */
    const t = val.trim();
    if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
      return pgLit(t) + '::jsonb';
    }
  }
  if (typeof val === 'number') return String(val);
  /** Mot de passe bcrypt: pas de doubling des $ nécessaires si littéral */
  return pgLit(val);
}

function blockToPgSql(block) {
  const cols = extractColumns(block.headerSlice);
  const tuples = parseRows(block.valuesFragment);
  const lines = tuples
    .map((row) => {
      if (row.length !== cols.length) {
        throw new Error(
          `${block.table}: ${row.length} valeurs vs ${cols.length} colonnes`,
        );
      }
      const cells = row.map((v, k) => coerce(block.table, cols[k], v));
      return `(${cells.join(', ')})`;
    })
    .join(',\n');
  return `INSERT INTO "${block.table}" (${cols
    .map(pgQuoteIdent)
    .join(', ')})\nVALUES\n${lines};`;
}

async function main() {
  const dumpPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_DUMP;
  if (!fs.existsSync(dumpPath)) {
    console.error(`Fichier introuvable: ${dumpPath}`);
    process.exit(1);
  }

  const full = fs.readFileSync(dumpPath, 'utf8');
  const blocks = extractOrderedBlocks(full);
  if (blocks.length !== IMPORT_ORDER.length) {
    console.warn(
      `Attention: ${blocks.length} blocs extraits (attendu ${IMPORT_ORDER.length}). Vérifiez le dump.`,
    );
  }

  const prisma = new PrismaClient();
  const truncate = `
    TRUNCATE TABLE
      payments,
      notifications_custom,
      bookings,
      services,
      profiles,
      personal_access_tokens,
      users,
      categories
    RESTART IDENTITY CASCADE;
  `;

  console.log(`Import depuis: ${dumpPath}`);
  await prisma.$executeRawUnsafe(truncate);
  for (const block of blocks) {
    console.log(`  → ${block.table} (${extractColumns(block.headerSlice).length} colonnes)`);
    await prisma.$executeRawUnsafe(blockToPgSql(block));
  }
  console.log('Synchronisation des séquences PostgreSQL…');
  await syncPostgresIdSequences(prisma, { log: true });
  console.log('Terminé.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
