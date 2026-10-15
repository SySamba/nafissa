/**
 * Coordonnées approximatives des quartiers de Dakar et sa région.
 * Utilisé pour trier les prestataires par proximité du lieu d'intervention
 * sans dépendre d'un service de géocodage externe.
 * Format : [lat, lng].
 */
/** Variantes orthographiques fréquentes → nom canonique dans AREAS. */
const ALIASES = {
  'niary tally': 'niarry tally',
  'niari tally': 'niarry tally',
  'nyary tally': 'niarry tally',
  'sacré coeur': 'sacré-cœur',
  'sacre coeur': 'sacré-cœur',
  'sacrecoeur': 'sacré-cœur',
  'almadie': 'almadies',
  'ouest foire': 'ouest-foire',
  'nord foire': 'nord-foire',
  'sud foire': 'sud-foire',
  'dakar plateau': 'dakar-plateau',
  'ngor almadie': 'ngor-almadies',
  'parcelles': 'parcelles assainies',
  'grand medine': 'grand médine',
  'hann': 'hann bel-air',
  'guediawaye': 'guédiawaye',
};

const AREAS = {
  'almadies': [14.745, -17.516],
  'amitié': [14.719, -17.459],
  'baobab': [14.705, -17.448],
  'bel-air': [14.710, -17.425],
  'biscuiterie': [14.700, -17.437],
  'bourguiba': [14.718, -17.456],
  'camberene': [14.755, -17.424],
  'cambérène': [14.755, -17.424],
  'castors': [14.727, -17.448],
  'cité avion': [14.756, -17.447],
  'cité keur gorgui': [14.733, -17.441],
  'cité mixta': [14.719, -17.449],
  'colobane': [14.700, -17.448],
  'corniche': [14.706, -17.470],
  'dakar-plateau': [14.676, -17.435],
  'dalifort': [14.746, -17.404],
  'diamagueune': [14.733, -17.380],
  'dieuppeul': [14.710, -17.441],
  'fann': [14.705, -17.466],
  'fass': [14.698, -17.445],
  'fass pailleurs': [14.746, -17.438],
  'grand dakar': [14.704, -17.451],
  'grand mbao': [14.737, -17.315],
  'grand médine': [14.681, -17.449],
  'grand yoff': [14.734, -17.454],
  'golf sud': [14.744, -17.439],
  'gueule tapée': [14.689, -17.450],
  'guediawaye': [14.776, -17.397],
  'hann bel-air': [14.720, -17.423],
  'hann maristes': [14.716, -17.427],
  'hlm': [14.711, -17.445],
  'kaolack': [14.719, -17.442],
  'keur massar': [14.786, -17.298],
  'liberté': [14.709, -17.457],
  'malika': [14.773, -17.322],
  'mamelles': [14.727, -17.502],
  'mariste': [14.716, -17.427],
  'mbao': [14.730, -17.325],
  'mbour': [14.424, -16.964],
  'médina gounass': [14.683, -17.453],
  'médina': [14.679, -17.448],
  'mermoz': [14.712, -17.478],
  'ngor': [14.752, -17.522],
  'ngor-almadies': [14.748, -17.520],
  'niarry tally': [14.724, -17.447],
  'nord-foire': [14.751, -17.484],
  'ouakam': [14.722, -17.489],
  'ouest-foire': [14.743, -17.478],
  'parcelles assainies': [14.768, -17.429],
  'patte d\'oie': [14.731, -17.462],
  'pikine': [14.755, -17.390],
  'plateau': [14.670, -17.437],
  'point-e': [14.702, -17.470],
  'pompidou': [14.692, -17.452],
  'rébeuss': [14.681, -17.443],
  'rufisque': [14.716, -17.273],
  'sacré-cœur': [14.718, -17.477],
  'sacre-coeur': [14.718, -17.477],
  'sicap': [14.714, -17.450],
  'sicap baobabs': [14.706, -17.450],
  'sicap liberté': [14.710, -17.458],
  'sicap mermoz': [14.713, -17.476],
  'sud-foire': [14.734, -17.472],
  'thaione': [14.775, -17.352],
  'thiaroye': [14.746, -17.370],
  'thiès': [14.789, -16.926],
  'wakhinane nimzatt': [14.775, -17.370],
  'tilène': [14.687, -17.445],
  'yeumbeul': [14.762, -17.332],
  'yoff': [14.749, -17.477],
  'zone a': [14.768, -17.425],
  'zone b': [14.762, -17.419],
};

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,#\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cherche un quartier connu dans un texte d'adresse libre
 * (« Mermoz, Dakar », « Sacré-Cœur 3 », …).
 * Renvoie { name, lat, lng } ou null.
 */
export function locateArea(text) {
  const n = normalize(text);
  if (!n) return null;
  let best = null;
  // 1. Variantes orthographiques (« niary tally », « sacre coeur »…)
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    const key = normalize(alias);
    if (AREAS[canonical] && n.includes(key) && (!best || key.length > best.key.length)) {
      const [lat, lng] = AREAS[canonical];
      best = { key, name: canonical, lat, lng };
    }
  }
  // 2. Nom de quartier contenu dans le texte (le plus long gagne).
  for (const [name, [lat, lng]] of Object.entries(AREAS)) {
    const key = normalize(name);
    if (n.includes(key) && (!best || key.length > best.key.length)) {
      best = { key, name, lat, lng };
    }
  }
  return best ? { name: best.name, lat: best.lat, lng: best.lng } : null;
}

/** Distance orthodromique (vol d'oiseau) en kilomètres. */
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
}
