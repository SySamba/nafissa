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

/**
 * Suggestions d'adresses pour l'autocomplétion du formulaire de demande.
 * Renvoie jusqu'à `limit` lieux au Sénégal : [{ lat, lng, label }].
 */
export async function searchAddresses(text, { limit = 6 } = {}) {
  const q = String(text || '').trim();
  if (q.length < 3) return [];
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=sn&accept-language=fr` +
      `&limit=${limit}&q=${encodeURIComponent(/dakar|senegal|sénégal/i.test(q) ? q : `${q}, Dakar, Sénégal`)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nafissa-platform/1.0 (suggestions adresses, Dakar)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const hits = await res.json();
    const seen = new Set();
    return (hits || [])
      .map((h) => {
        const parts = String(h.display_name || '').split(',').map((s) => s.trim());
        // Libellé court : nom du lieu + 2 niveaux de contexte, sans doublons.
        const label = [...new Set(parts.slice(0, 4))].join(', ');
        return { lat: Number(h.lat), lng: Number(h.lon), label };
      })
      .filter((h) => h.label && Number.isFinite(h.lat) && Number.isFinite(h.lng))
      .filter((h) => (seen.has(h.label) ? false : (seen.add(h.label), true)));
  } catch {
    return [];
  }
}

/**
 * Coordonnées → adresse lisible (« Rue 10, Mermoz, Dakar »), via Nominatim.
 * Renvoie null si le service ne répond pas.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=fr` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nafissa-platform/1.0 (geolocalisation demandes, Dakar)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const hit = await res.json();
    if (!hit || hit.error) return null;
    const a = hit.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(' ');
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.village;
    const city = a.city || a.town || a.county || a.state;
    const parts = [street, area, city].filter(Boolean);
    const label = [...new Set(parts)].join(', ') || hit.display_name;
    return { label, full: hit.display_name };
  } catch {
    return null;
  }
}
