export const BS = {
  EN_ATTENTE_ADMIN: 'en_attente_admin',
  EN_ATTENTE_PRESTATAIRE: 'en_attente_prestataire',
  ACCEPTEE: 'acceptee',
  REFUSEE: 'refusee',
  PAYEE: 'payee',
  EN_COURS: 'en_cours',
  TERMINEE: 'terminee',
  ANNULEE: 'annulee',
};

export const PS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
};

export const ES = {
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
};

export const COMMISSION_RATE = 0.1;

/**
 * Catégories retirées de l'offre NAFISSA : invisibles dans les listes
 * publiques et refusées à la création de demande, même si la ligne est
 * encore marquée active en base (sécurise le retrait avant migration).
 */
const RETIRED_CATEGORY_NAMES = ['cuisine'];

export function isRetiredCategory(category) {
  return !!category && RETIRED_CATEGORY_NAMES.includes(String(category.name || '').toLowerCase());
}
