import { locateArea } from './dakar-areas.js';

/**
 * Géocodage d'une adresse libre → { lat, lng }.
 *
 * 1. La carte locale des quartiers de Dakar répond instantanément et hors-ligne.
 * 2. Sinon, on interroge Nominatim (OpenStreetMap — gratuit, sans clé, limité
 *    à ~1 requête/seconde : n'appeler que lors d'écritures, jamais en boucle).
 *
 * Renvoie null si aucune des deux sources ne trouve l'adresse.
 */
export async function geocodeAddress(text, { skipRemote = false } = {}) {
  const q = String(text || '').trim();
  if (!q) return null;

  const local = locateArea(q);
  if (local) return { lat: local.lat, lng: local.lng, source: 'local', label: local.name };

  if (skipRemote) return null;

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=sn` +
      `&q=${encodeURIComponent(q.includes('dakar') || q.includes('Dakar') ? `${q}, Sénégal` : `${q}, Dakar, Sénégal`)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nafissa-platform/1.0 (geocodage adresses, Dakar)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    return { lat: Number(hit.lat), lng: Number(hit.lon), source: 'nominatim', label: hit.display_name };
  } catch {
    return null;
  }
}
