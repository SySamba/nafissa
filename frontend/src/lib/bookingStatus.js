import { Clock, CheckCircle, XCircle, CreditCard, Loader, Flag, Ban } from 'lucide-react';

/**
 * Référentiel unique des statuts de réservation.
 * Aligné sur les constantes backend (backend-node/src/lib/constants.js).
 */
export const BOOKING_STATUS = {
  en_attente_admin: {
    label: 'En attente admin',
    short: 'Attente admin',
    color: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
    bar: 'bg-amber-400',
    icon: Clock,
    group: 'active',
  },
  en_attente_prestataire: {
    label: 'En attente prestataire',
    short: 'Attente presta.',
    color: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500',
    bar: 'bg-orange-400',
    icon: Clock,
    group: 'active',
  },
  acceptee: {
    label: 'Acceptée',
    short: 'Acceptée',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
    bar: 'bg-blue-400',
    icon: CheckCircle,
    group: 'active',
  },
  payee: {
    label: 'Payée',
    short: 'Payée',
    color: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
    bar: 'bg-purple-400',
    icon: CreditCard,
    group: 'active',
  },
  en_cours: {
    label: 'En cours',
    short: 'En cours',
    color: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-400',
    icon: Loader,
    group: 'active',
  },
  terminee: {
    label: 'Terminée',
    short: 'Terminée',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-600',
    bar: 'bg-green-500',
    icon: Flag,
    group: 'done',
  },
  refusee: {
    label: 'Refusée',
    short: 'Refusée',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
    bar: 'bg-red-400',
    icon: XCircle,
    group: 'closed',
  },
  annulee: {
    label: 'Annulée',
    short: 'Annulée',
    color: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    bar: 'bg-gray-300',
    icon: Ban,
    group: 'closed',
  },
};

export const DEFAULT_STATUS = BOOKING_STATUS.en_attente_admin;

/** Retourne la configuration d'un statut, avec repli sûr. */
export function statusConfig(status) {
  return BOOKING_STATUS[status] || DEFAULT_STATUS;
}

/** Liste [{ value, label }] utilisable pour des filtres. */
export function statusOptions() {
  return Object.entries(BOOKING_STATUS).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  }));
}

/**
 * Répartition des réservations par statut, triée par volume décroissant.
 * @param {Array} bookings
 * @returns {Array<{ status: string, count: number, share: number, config: object }>}
 */
export function statusBreakdown(bookings = []) {
  if (!bookings.length) return [];

  const counts = new Map();
  for (const booking of bookings) {
    const key = BOOKING_STATUS[booking.status] ? booking.status : 'en_attente_admin';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([status, count]) => ({
      status,
      count,
      share: Math.round((count / bookings.length) * 100),
      config: BOOKING_STATUS[status],
    }))
    .sort((a, b) => b.count - a.count);
}

/** Nombre de réservations encore en circulation (non terminées / non closes). */
export function countActive(bookings = []) {
  return bookings.filter((b) => statusConfig(b.status).group === 'active').length;
}
