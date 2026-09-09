import { prisma } from './prisma.js';
import { hashSanctumSecret } from './sanctum.js';

export const TOKENABLE_TYPE = process.env.TOKENABLE_TYPE || String.raw`App\Models\User`;

export async function resolveAuth(header) {
  if (!header?.startsWith('Bearer ')) return null;
  const bearer = header.slice(7).trim();
  if (!bearer) return null;

  if (!bearer.includes('|')) {
    const hash = hashSanctumSecret(bearer);
    const row = await prisma.personalAccessToken.findFirst({ where: { token: hash } });
    if (!row || row.tokenableType !== TOKENABLE_TYPE) return null;
    if (row.expiresAt && row.expiresAt < new Date()) return null;
    const user = await prisma.user.findUnique({ where: { id: row.tokenableId } });
    return user ? { user, token: row } : null;
  }

  const pipe = bearer.indexOf('|');
  const idPart = bearer.slice(0, pipe);
  const secretPart = bearer.slice(pipe + 1);
  const id = BigInt(idPart);
  const row = await prisma.personalAccessToken.findUnique({ where: { id } });
  if (!row || row.tokenableType !== TOKENABLE_TYPE) return null;
  if (row.expiresAt && row.expiresAt < new Date()) return null;
  if (row.token !== hashSanctumSecret(secretPart)) return null;

  const user = await prisma.user.findUnique({ where: { id: row.tokenableId } });
  return user ? { user, token: row } : null;
}
