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

export function stripUser(u) {
  if (!u) return u;
  const { password, rememberToken, ...rest } = u;
  return { ...rest };
}
