import crypto from 'crypto';
import CRC32 from 'crc-32';

const TOKEN_PREFIX = process.env.SANCTUM_TOKEN_PREFIX || '';

/** Réplique Laravel Str::random($len) (base64, sans /+=) */
export function laravelStrRandom(len) {
  let str = '';
  while (str.length < len) {
    const need = len - str.length;
    const bytes = crypto.randomBytes(need);
    const chunk = Buffer.from(bytes).toString('base64').replace(/[/+=]/g, '');
    str += chunk.slice(0, need);
  }
  return str.slice(0, len);
}

/** Équivalent Sanctum HasApiTokens::generateTokenString */
export function generateSanctumSecret() {
  const entropy = laravelStrRandom(40);
  const crc = (CRC32.str(entropy) >>> 0).toString(16).padStart(8, '0');
  return `${TOKEN_PREFIX}${entropy}${crc}`;
}

export function hashSanctumSecret(secretPart) {
  return crypto.createHash('sha256').update(secretPart).digest('hex');
}

export function composeBearerToken(tokenId, secretPart) {
  return `${tokenId}|${secretPart}`;
}
