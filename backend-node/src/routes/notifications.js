import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';

export default async function notificationRoutes(fastify) {
  fastify.get('/notifications', { preHandler: authMiddleware }, async (request) => {
    const user = request.user;
    const page = Number(request.query?.page) || 1;
    const perPage = 20;

    const [total, rows] = await prisma.$transaction([
      prisma.notificationRow.count({ where: { userId: user.id } }),
      prisma.notificationRow.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return laravelPaginated(rows, total, page, perPage, fullResourcePath(request));
  });

  fastify.get('/notifications/unread-count', { preHandler: authMiddleware }, async (request) => {
    const count = await prisma.notificationRow.count({
      where: { userId: request.user.id, isRead: false },
    });
    return { count };
  });

  fastify.patch('/notifications/:id/read', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const n = await prisma.notificationRow.findUnique({ where: { id } });
    if (!n || n.userId !== request.user.id) {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }
    await prisma.notificationRow.update({ where: { id }, data: { isRead: true } });
    return { message: 'Notification lue.' };
  });

  fastify.patch('/notifications/read-all', { preHandler: authMiddleware }, async (request) => {
    await prisma.notificationRow.updateMany({
      where: { userId: request.user.id, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Toutes les notifications marquées comme lues.' };
  });
}
