import { prisma } from './prisma.js';

const userInclude = { profile: true };

export async function userWithProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });
}

/** Vue publique d'un prestataire : jamais de contacts, pièces d'identité ni date de naissance. */
export function publicProvider(u) {
  if (!u) return u;
  const p = u.profile;
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    verified: u.verified,
    photo: u.photo,
    createdAt: u.createdAt,
    profile: p
      ? { bio: p.bio, avatar: p.avatar, location: p.location, rating: p.rating, status: p.status }
      : null,
  };
}

export function withPublicProvider(service) {
  return service ? { ...service, provider: publicProvider(service.provider) } : service;
}

/**
 * Vue du prestataire dans une réservation :
 * - admin et prestataire attribué : fiche complète (contacts inclus) ;
 * - client : identité publique uniquement (nom, photo, note) — jamais
 *   de téléphone, email ni pièces d'identité.
 */
export function bookingForViewer(booking, user) {
  if (!booking?.provider) return booking;
  if (user?.role === 'admin' || user?.id === booking.providerId) return booking;
  return { ...booking, provider: publicProvider(booking.provider) };
}

/**
 * Vue publique d'une annonce : le prestataire n'est pas identifiable avant
 * l'attribution (c'est l'équipe qui choisit le profil). On expose juste un
 * indicateur « annonce réservable » au lieu des données du prestataire.
 */
export function withHiddenProvider(service) {
  if (!service) return service;
  const { provider, ...rest } = service;
  return {
    ...rest,
    provider: null,
    provider_active: provider?.verified === true && provider?.profile?.status === 'active',
  };
}

/** Libellé d'une demande : titre de l'annonce ou, à défaut, la catégorie demandée. */
export function bookingLabel(b) {
  return b?.service?.title ?? b?.category?.name ?? 'service';
}

export function stripUser(u) {
  if (!u) return u;
  const { password, rememberToken, ...rest } = u;
  return { ...rest };
}
