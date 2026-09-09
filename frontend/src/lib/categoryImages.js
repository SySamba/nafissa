/**
 * Visuels de catégories — images du dossier public/.
 * Les images sont servies depuis / (racine publique) → fiables, rapides
 * et toujours affichées (aucune dépendance réseau).
 * Le dégradé + emoji servent de repli si une image manque.
 */

const VISUALS = {
  home:       { gradient: 'from-primary to-primary-light', emoji: '🏠', image: '/Menage.png' },
  laundry:    { gradient: 'from-secondary to-secondary-light', emoji: '🧺', image: '/Lavage et repassage.png' },
  shopping:   { gradient: 'from-primary-light to-secondary', emoji: '🛒', image: '/Course.png' },
  baby:       { gradient: 'from-secondary-light to-secondary', emoji: '👶', image: '/Garde enfant.png' },
  utensils:   { gradient: 'from-secondary to-primary-light', emoji: '🍳', image: '/Cuisine.png' },
  scissors:   { gradient: 'from-primary to-secondary', emoji: '✂️', image: null },
  'book-open':{ gradient: 'from-primary to-secondary', emoji: '📚', image: '/soutien scolaire.png' },
  sparkles:   { gradient: 'from-secondary to-primary', emoji: '✨', image: null },
  wrench:     { gradient: 'from-primary-dark to-primary', emoji: '🔧', image: null },
  zap:        { gradient: 'from-secondary to-secondary-dark', emoji: '⚡', image: '/Electricien.png' },
  plumber:    { gradient: 'from-primary to-primary-light', emoji: '🚰', image: '/Plombier.png' },
  carpenter:  { gradient: 'from-primary-dark to-secondary-dark', emoji: '🪚', image: '/Menuisier.png' },
};

const DEFAULT_VISUAL = { gradient: 'from-primary to-secondary', emoji: '🧰', image: null };

const BY_NAME_HINT = [
  [/lavage|repassage|linge/i, 'laundry'],
  [/course|achat|march[eé]/i, 'shopping'],
  [/m[eé]nage|nettoyage/i, 'home'],
  [/garde|nounou|enfant/i, 'baby'],
  [/coiff/i, 'scissors'],
  [/cuisine|repas/i, 'utensils'],
  [/scolaire|cours|soutien/i, 'book-open'],
  [/beaut[eé]|bien/i, 'sparkles'],
  [/plomb/i, 'plumber'],
  [/menuis|bois/i, 'carpenter'],
  [/r[eé]paration|d[eé]pann|ouvrier/i, 'wrench'],
  [/[ée]lectric/i, 'zap'],
];

function resolveKey(categoryLike) {
  if (!categoryLike) return null;
  const iconKey = categoryLike.icon != null ? String(categoryLike.icon).toLowerCase() : '';
  if (iconKey && VISUALS[iconKey]) return iconKey;
  const name = categoryLike.name != null ? String(categoryLike.name) : '';
  if (name) {
    const hit = BY_NAME_HINT.find(([re]) => re.test(name));
    if (hit) return hit[1];
  }
  return null;
}

/** Renvoie { gradient, emoji, image } pour une catégorie (icône ou nom). */
export function categoryVisual(categoryLike) {
  const key = resolveKey(categoryLike);
  return key ? VISUALS[key] : DEFAULT_VISUAL;
}

/** Visuel d'une catégorie d'accueil à partir de son « slug » (= icône). */
export function homepageCategoryVisual(slug) {
  return categoryVisual({ icon: slug });
}
