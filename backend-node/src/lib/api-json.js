import { Decimal } from '@prisma/client/runtime/library';

function camelToSnakeKey(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/__/g, '_').toLowerCase();
}

/** Aligne les réponses sur le même contrat JSON que Laravel (snake_case + dates lisibles). */
export function prismaPayloadToApiJson(payload) {
  const redacted = redactSecretsDeep(payload);
  const snake = keysToSnakeDeep(redacted);
  return normalizeApiDatesDeep(snake);
}

function redactSecretsDeep(obj) {
  if (obj == null) return obj;
  if (Decimal.isDecimal(obj)) return Number(obj);
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map((x) => redactSecretsDeep(x));
  if (typeof obj !== 'object') return obj;
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (k === 'password' || k === 'rememberToken') {
      delete out[k];
      continue;
    }
    const v = out[k];
    if (v instanceof Date) {
      out[k] = v.toISOString();
      continue;
    }
    if (v && typeof v === 'object') {
      if (Decimal.isDecimal(v)) out[k] = Number(v);
      else out[k] = redactSecretsDeep(v);
    }
  }
  return out;
}

function keysToSnakeDeep(obj, depth = 0) {
  if (depth > 40) return obj;
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map((x) => keysToSnakeDeep(x, depth + 1));
  if (typeof obj !== 'object') return obj;
  /** Ne pas descendre dans Date (après redact les dates sont ISO string ou ici dernier-filet). */
  if (obj instanceof Date) return obj.toISOString();
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const nk = camelToSnakeKey(k);
    if (v === null || v === undefined) {
      out[nk] = v;
      continue;
    }
    if (typeof v !== 'object') {
      out[nk] = v;
      continue;
    }
    if (v instanceof Date) {
      out[nk] = v.toISOString();
      continue;
    }
    if (Decimal.isDecimal(v)) out[nk] = Number(v);
    else if (Array.isArray(v)) out[nk] = keysToSnakeDeep(v, depth + 1);
    else out[nk] = keysToSnakeDeep(v, depth + 1);
  }
  return out;
}

function normalizeApiDatesDeep(obj, depth = 0) {
  if (depth > 40 || obj == null) return obj;
  if (Array.isArray(obj)) return obj.map((x) => normalizeApiDatesDeep(x, depth + 1));
  if (typeof obj !== 'object') return obj;
  const o = { ...obj };
  if ('booking_date' in o && o.booking_date != null) {
    const d = String(o.booking_date);
    if (d.includes('T')) {
      const [part] = d.split('T');
      o.booking_date = part;
    } else if (d.length >= 10) {
      o.booking_date = d.slice(0, 10);
    }
  }
  if ('booking_time' in o && o.booking_time != null) {
    const t = String(o.booking_time);
    if (t.includes('T')) {
      const timePart = t.split('T')[1] ?? '';
      o.booking_time = timePart.slice(0, 5);
    } else if (t.length >= 8 && t.includes(':')) {
      o.booking_time = t.slice(0, 5);
    }
  }
  if ('date_of_birth' in o && o.date_of_birth != null && String(o.date_of_birth).includes('T')) {
    o.date_of_birth = String(o.date_of_birth).split('T')[0];
  }
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object' && !(v instanceof Date))
      o[k] = normalizeApiDatesDeep(v, depth + 1);
  }
  return o;
}
