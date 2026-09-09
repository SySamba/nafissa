/**
 * Visuels de catégories pour le mobile — illustrations locales (bundlées).
 *
 * On n'utilise plus d'URLs distantes (Unsplash renvoyait des 404 → images
 * cassées). Les illustrations sont optimisées (~70 Ko), fiables et hors-ligne.
 * `colors` + `emoji` servent de repli si une catégorie inconnue apparaît.
 */
import type { ImageSourcePropType } from 'react-native';

export type CategoryVisual = {
  colors: [string, string];
  emoji: string;
  icon: string;
  image: ImageSourcePropType | null;
};

const VISUALS: Record<string, CategoryVisual> = {
  home: {
    colors: ['#44512F', '#5E6E42'],
    emoji: '🏠',
    icon: 'home',
    image: require('@/assets/images/categories/home.jpg'),
  },
  laundry: {
    colors: ['#C9A15A', '#D8B87B'],
    emoji: '🧺',
    icon: 'shirt',
    image: require('@/assets/images/categories/sparkles.jpg'),
  },
  shopping: {
    colors: ['#5E6E42', '#C9A15A'],
    emoji: '🛒',
    icon: 'cart',
    image: require('@/assets/images/categories/shopping.png'),
  },
  baby: {
    colors: ['#D8B87B', '#C9A15A'],
    emoji: '👶',
    icon: 'happy',
    image: require('@/assets/images/categories/baby.jpg'),
  },
  scissors: {
    colors: ['#44512F', '#C9A15A'],
    emoji: '✂️',
    icon: 'cut',
    image: require('@/assets/images/categories/scissors.jpg'),
  },
  utensils: {
    colors: ['#C9A15A', '#5E6E42'],
    emoji: '🍳',
    icon: 'restaurant',
    image: require('@/assets/images/categories/utensils.jpg'),
  },
  'book-open': {
    colors: ['#44512F', '#C9A15A'],
    emoji: '📚',
    icon: 'book',
    image: require('@/assets/images/categories/book-open.jpg'),
  },
  sparkles: {
    colors: ['#C9A15A', '#44512F'],
    emoji: '✨',
    icon: 'sparkles',
    image: require('@/assets/images/categories/sparkles.jpg'),
  },
  wrench: {
    colors: ['#333D24', '#44512F'],
    emoji: '🔧',
    icon: 'build',
    image: require('@/assets/images/categories/wrench.jpg'),
  },
  zap: {
    colors: ['#C9A15A', '#A8843F'],
    emoji: '⚡',
    icon: 'flash',
    image: require('@/assets/images/categories/zap.jpg'),
  },
  plumber: {
    colors: ['#44512F', '#5E6E42'],
    emoji: '🚰',
    icon: 'water',
    image: require('@/assets/images/categories/wrench.jpg'),
  },
  carpenter: {
    colors: ['#333D24', '#A8843F'],
    emoji: '🪚',
    icon: 'hammer',
    image: require('@/assets/images/categories/wrench.jpg'),
  },
};

const DEFAULT_VISUAL: CategoryVisual = {
  colors: ['#44512F', '#C9A15A'],
  emoji: '🧰',
  icon: 'briefcase',
  image: null,
};

const BY_NAME_HINT: [RegExp, string][] = [
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

function resolveKey(categoryLike?: { icon?: string | null; name?: string | null } | null): string | null {
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

export function categoryVisual(
  categoryLike?: { icon?: string | null; name?: string | null } | null
): CategoryVisual {
  const key = resolveKey(categoryLike);
  return key ? VISUALS[key] : DEFAULT_VISUAL;
}
