import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { BS } from '../lib/constants.js';
import { notify, bookingDetailPath } from '../lib/notifications.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { stripUser, userWithProfile } from '../lib/serializers.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';

const bookingIncludeAdmin = {
  service: { include: { category: true } },
  client: { include: { profile: true } },
  provider: { include: { profile: true } },
};

export default async function adminRoutes(fastify) {
  const pre = [authMiddleware, adminMiddleware];

  fastify.get('/admin/dashboard', { preHandler: pre }, async () => {
    const [
      total_users,
      pending_accounts,
      pending_bookings,
      total_bookings,
      active_bookings,
      revenueRows,
      paymentSumRows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verified: false } }),
      prisma.booking.count({ where: { status: BS.EN_ATTENTE_ADMIN } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: {
            in: [
              BS.EN_ATTENTE_ADMIN,
              BS.EN_ATTENTE_PRESTATAIRE,
              BS.ACCEPTEE,
              BS.PAYEE,
              BS.EN_COURS,
            ],
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { commission: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      stats: {
        total_users,
        pending_accounts,
        pending_bookings,
        total_bookings,
        active_bookings,
        total_revenue: Number(revenueRows._sum.commission ?? 0),
        total_payments: Number(paymentSumRows._sum.amount ?? 0),
      },
    };
  });

  fastify.get('/admin/bookings/pending', { preHandler: pre }, async (request) => {
    const page = Number(request.query?.page) || 1;
    const perPage = 10;

    const where = { status: BS.EN_ATTENTE_ADMIN };

    const [total, rows] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: bookingIncludeAdmin,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return laravelPaginated(rows, total, page, perPage, fullResourcePath(request));
  });

  fastify.get('/admin/bookings/:id/providers', { preHandler: pre }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    const catId = booking.service.categoryId;

    const candidates = await prisma.user.findMany({
      where: {
        role: { in: ['etudiant', 'artisan'] },
        verified: true,
        profile: { status: 'active' },
        services: { some: { categoryId: catId } },
      },
      include: { profile: true, services: true },
    });

    const providers = [];
    for (const p of candidates) {
      const completedMissions = await prisma.booking.count({
        where: { providerId: p.id, status: BS.TERMINEE },
      });
      providers.push({
        id: p.id.toString(),
        name: p.name,
        email: p.email,
        phone: p.phone,
        address: p.address,
        role: p.role,
        photo: p.photo,
        gender: p.gender,
        date_of_birth: p.dateOfBirth,
        id_card_recto: p.idCardRecto,
        id_card_verso: p.idCardVerso,
        created_at: p.createdAt,
        rating: p.profile ? Number(p.profile.rating) : 0,
        bio: p.profile?.bio,
        avatar: p.profile?.avatar,
        missions_terminees: completedMissions,
        services_count: p.services.length,
      });
    }

    providers.sort((a, b) => b.rating - a.rating);

    return { providers };
  });

  fastify.patch('/admin/bookings/:id/assign', { preHandler: pre }, async (request, reply) => {
    const schema = z.object({ provider_id: z.coerce.bigint() });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'provider_id requis.' });
    const bookingId = BigInt(request.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, client: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    if (booking.status !== BS.EN_ATTENTE_ADMIN) {
      return reply.code(422).send({ message: "Cette demande n'est pas en attente d'attribution." });
    }

    const provider = await prisma.user.findUnique({
      where: { id: parsed.data.provider_id },
      include: { profile: true },
    });
    if (!provider || (provider.role !== 'etudiant' && provider.role !== 'artisan')) {
      return reply.code(422).send({ message: 'Ce prestataire n\'est pas valide.' });
    }
    if (!provider.verified) {
      return reply.code(422).send({ message: 'Ce prestataire n\'est pas valide.' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { providerId: provider.id, status: BS.EN_ATTENTE_PRESTATAIRE },
      include: {
        service: { include: { category: true } },
        client: true,
        provider: { include: { profile: true } },
      },
    });

    const bp = bookingDetailPath(bookingId);
    await notify(
      provider.id,
      'booking',
      'Nouvelle mission attribuée',
      `L'administrateur vous a attribué une mission pour « ${booking.service.title} ». Veuillez accepter ou refuser.`,
      bp,
    );
    await notify(
      booking.clientId,
      'booking',
      'Prestataire trouvé',
      `Un prestataire a été choisi pour votre demande « ${booking.service.title} ». En attente de sa confirmation.`,
      bp,
    );

    return {
      message: 'Prestataire attribué avec succès.',
      booking: updated,
    };
  });

  fastify.get('/admin/users/pending', { preHandler: pre }, async (request) => {
    const page = Number(request.query?.page) || 1;
    const perPage = 10;

    const where = { verified: false, role: { in: ['etudiant', 'artisan'] } };

    const [total, rows] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    const data = rows.map(stripUser);
    return laravelPaginated(data, total, page, perPage, fullResourcePath(request));
  });

  fastify.patch('/admin/users/:id/validate', { preHandler: pre }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (!user) return reply.code(404).send({ message: 'Non trouvé.' });
    if (user.verified) return reply.code(422).send({ message: 'Ce compte est déjà validé.' });

    await prisma.user.update({ where: { id }, data: { verified: true } });
    await prisma.profile.updateMany({ where: { userId: id }, data: { status: 'active' } });

    await notify(id, 'account', 'Compte validé', 'Votre compte a été validé par l\'administrateur. Vous pouvez maintenant proposer vos services.', '/profile');

    const fresh = await userWithProfile(id);
    return { message: 'Compte validé avec succès.', user: stripUser(fresh) };
  });

  fastify.patch('/admin/users/:id/reject', { preHandler: pre }, async (request, reply) => {
    const schema = z.object({ reason: z.string().max(500).optional().nullable() });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const id = BigInt(request.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.code(404).send({ message: 'Non trouvé.' });

    await prisma.profile.updateMany({ where: { userId: id }, data: { status: 'suspended' } });
    const reason = parsed.data.reason ?? 'Documents insuffisants.';
    await notify(
      id,
      'account',
      'Compte refusé',
      `Votre demande de validation a été refusée. Raison : ${reason}`,
      '/profile',
    );

    const fresh = await userWithProfile(id);
    return { message: 'Compte refusé.', user: stripUser(fresh) };
  });

  fastify.get('/admin/users', { preHandler: pre }, async (request) => {
    const page = Number(request.query?.page) || 1;
    const perPage = 15;
    const q = request.query || {};

    const where = {};
    if (q.role) where.role = q.role;
    if (q.verified !== undefined && q.verified !== '') {
      where.verified = q.verified === 'true' || q.verified === true || q.verified === '1';
    }

    const [total, rows] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    const data = rows.map(stripUser);
    return laravelPaginated(data, total, page, perPage, fullResourcePath(request));
  });

  fastify.patch('/admin/users/:id/suspend', { preHandler: pre }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.code(404).send({ message: 'Non trouvé.' });
    if (user.role === 'admin') {
      return reply.code(403).send({ message: 'Impossible de suspendre un administrateur.' });
    }

    await prisma.profile.updateMany({ where: { userId: id }, data: { status: 'suspended' } });
    await notify(
      id,
      'account',
      'Compte suspendu',
      'Votre compte a été suspendu par l\'administrateur.',
      '/profile',
    );

    const fresh = await userWithProfile(id);
    return { message: 'Utilisateur suspendu.', user: stripUser(fresh) };
  });
}
