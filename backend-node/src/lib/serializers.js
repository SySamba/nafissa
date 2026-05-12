import { prisma } from './prisma.js';

const userInclude = { profile: true };

export async function userWithProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });
}

export function stripUser(u) {
  if (!u) return u;
  const { password, rememberToken, ...rest } = u;
  return { ...rest };
}
