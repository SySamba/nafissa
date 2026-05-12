import { prisma } from './prisma.js';

/** Chemin relatif front (ex: /bookings/6) — jamais une URL absolue externe depuis l’API métier. */
export function bookingDetailPath(bookingId) {
  return `/bookings/${String(bookingId)}`;
}

export async function notify(userId, type, title, message, actionLink = null) {
  return prisma.notificationRow.create({
    data: {
      userId,
      type,
      title,
      message,
      ...(actionLink ? { actionLink } : {}),
    },
  });
}

export async function notifyAdmins(type, title, message, actionLink = null) {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  });
  if (!admins.length) return;
  await prisma.notificationRow.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type,
      title,
      message,
      ...(actionLink ? { actionLink } : {}),
    })),
  });
}
