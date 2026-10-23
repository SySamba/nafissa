import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { BS } from '../lib/constants.js';
import { notify, bookingDetailPath } from '../lib/notifications.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { bookingLabel, stripUser, userWithProfile } from '../lib/serializers.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';
import { TOKENABLE_TYPE } from '../lib/auth-resolve.js';
import { locateArea, distanceKm } from '../lib/dakar-areas.js';
import { sendWhatsApp, clientStatusText, waParams } from '../lib/whatsapp-send.js';

function revokeTokens(userId) {
  return prisma.personalAccessToken.deleteMany({
    where: { tokenableType: TOKENABLE_TYPE, tokenableId: userId },
  });
}

const ACTIVE_STATUSES = [BS.EN_ATTENTE_PRESTATAIRE, BS.ACCEPTEE, BS.PAYEE, BS.EN_COURS];

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
      include: { service: true, category: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    const catId = booking.service?.categoryId ?? booking.categoryId;
    if (!catId) return reply.code(422).send({ message: 'Cette demande n a pas de catégorie.' });

    const candidates = await prisma.user.findMany({
      where: {
        role: { in: ['etudiant', 'artisan'] },
        verified: true,
        isAvailable: true,
        profile: { status: 'active' },
        services: { some: { categoryId: catId, available: true } },
      },
      include: {
        profile: true,
        services: { include: { category: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    // Prestataires ayant déjà refusé cette demande (signalés et relégués en fin de liste).
    const refuserIds = new Set(
      (Array.isArray(booking.refusedBy) ? booking.refusedBy : []).map(String),
    );

    // Lieu d'intervention : coordonnées géocodées en priorité, carte des
    // quartiers en repli pour les anciennes données non géocodées.
    const interventionLoc =
      booking.lat != null && booking.lng != null
        ? { lat: Number(booking.lat), lng: Number(booking.lng) }
        : locateArea(booking.location);

    const ids = candidates.map((p) => p.id);

    const [statusCounts, sameDay, reviews] = ids.length
      ? await Promise.all([
          prisma.booking.groupBy({
            by: ['providerId', 'status'],
            where: { providerId: { in: ids } },
            _count: { _all: true },
          }),
          prisma.booking.findMany({
            where: {
              providerId: { in: ids },
              bookingDate: booking.bookingDate,
              status: { in: ACTIVE_STATUSES },
              id: { not: booking.id },
            },
            select: { providerId: true, bookingTime: true },
          }),
          prisma.booking.findMany({
            where: { providerId: { in: ids }, rating: { not: null } },
            select: {
              providerId: true,
              rating: true,
              review: true,
              updatedAt: true,
              service: { select: { title: true } },
              client: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
          }),
        ])
      : [[], [], []];

    const byProvider = (rows) => {
      const m = new Map();
      for (const r of rows) {
        const k = r.providerId.toString();
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(r);
      }
      return m;
    };
    const countsMap = byProvider(statusCounts);
    const sameDayMap = byProvider(sameDay);
    const reviewsMap = byProvider(reviews);

    const providers = candidates.map((p) => {
      const key = p.id.toString();
      const counts = Object.fromEntries(
        (countsMap.get(key) || []).map((c) => [c.status, c._count._all]),
      );
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const providerReviews = reviewsMap.get(key) || [];
      const busy = sameDayMap.get(key) || [];
      const matching = p.services.filter((s) => s.categoryId === catId && s.available);
      // Distance : coordonnées du service dans la catégorie demandée en
      // priorité, sinon coordonnées du compte, sinon quartier reconnu.
      const zoneArea =
        locateArea(matching[0]?.location) ||
        locateArea(p.address) ||
        locateArea(p.profile?.location);
      const providerLoc =
        (matching[0]?.lat != null && matching[0]?.lng != null
          ? { lat: Number(matching[0].lat), lng: Number(matching[0].lng) }
          : null) ||
        (p.lat != null && p.lng != null ? { lat: Number(p.lat), lng: Number(p.lng) } : null) ||
        zoneArea;
      const distance = distanceKm(interventionLoc, providerLoc);
      const zone = zoneArea?.name || matching[0]?.location || p.address || p.profile?.location || null;
      return {
        id: key,
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
        location: p.profile?.location,
        profile_status: p.profile?.status,
        documents: p.profile?.documents ?? null,
        missions_terminees: counts[BS.TERMINEE] || 0,
        missions_en_cours: ACTIVE_STATUSES.reduce((a, s) => a + (counts[s] || 0), 0),
        missions_annulees: counts[BS.ANNULEE] || 0,
        missions_total: total,
        services_count: p.services.length,
        category_price: matching.length ? Math.min(...matching.map((s) => Number(s.price))) : null,
        services: p.services.map((s) => ({
          id: s.id,
          title: s.title,
          price: s.price,
          price_unit: s.priceUnit,
          location: s.location,
          available: s.available,
          category: s.category?.name,
          same_category: s.categoryId === catId,
        })),
        reviews_count: providerReviews.length,
        recent_reviews: providerReviews.slice(0, 5).map((r) => ({
          rating: r.rating,
          review: r.review,
          date: r.updatedAt,
          service: r.service?.title,
          client: r.client?.name?.split(' ')[0] || 'Cliente',
        })),
        busy_same_day: busy.length,
        busy_times: busy.map((b) => b.bookingTime.toISOString().slice(11, 16)),
        a_refuse: refuserIds.has(key),
        zone,
        distance_km: distance,
      };
    });

    providers.sort(
      (a, b) =>
        (a.a_refuse ? 1 : 0) - (b.a_refuse ? 1 : 0) ||
        (a.distance_km ?? 9999) - (b.distance_km ?? 9999) ||
        (a.busy_same_day > 0) - (b.busy_same_day > 0) ||
        b.rating - a.rating ||
        b.missions_terminees - a.missions_terminees,
    );

    return { providers };
  });

  fastify.patch('/admin/bookings/:id/assign', { preHandler: pre }, async (request, reply) => {
    const schema = z.object({ provider_id: z.coerce.bigint() });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'provider_id requis.' });
    const bookingId = BigInt(request.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, client: true, category: true },
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
    if (!provider.verified || provider.profile?.status !== 'active') {
      return reply.code(422).send({ message: 'Ce prestataire n\'est pas valide.' });
    }
    if (!provider.isAvailable) {
      return reply.code(422).send({ message: 'Ce prestataire a désactivé sa disponibilité.' });
    }

    // Demande « par catégorie » (sans annonce choisie) : on rattache la
    // demande à l'offre du prestataire choisi dans cette catégorie, ce qui
    // fixe aussi le prix pour la suite (paiement).
    const data = { providerId: provider.id, status: BS.EN_ATTENTE_PRESTATAIRE };
    let linkedService = booking.service;
    if (!linkedService) {
      const catId = booking.categoryId;
      if (catId) {
        linkedService = await prisma.service.findFirst({
          where: { providerId: provider.id, categoryId: catId, available: true },
          orderBy: { price: 'asc' },
        });
        if (linkedService) {
          data.serviceId = linkedService.id;
          if (booking.totalPrice == null) data.totalPrice = linkedService.price;
        }
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data,
      include: {
        service: { include: { category: true } },
        category: true,
        client: true,
        provider: { include: { profile: true } },
      },
    });
    const label = bookingLabel(updated);

    const bp = bookingDetailPath(bookingId);
    await notify(
      provider.id,
      'booking',
      'Nouvelle mission attribuée',
      `L'administrateur vous a attribué une mission pour « ${label} ». Veuillez accepter ou refuser.`,
      bp,
    );
    await notify(
      booking.clientId,
      'booking',
      'Prestataire trouvé',
      `Un prestataire a été choisi pour votre demande « ${label} ». En attente de sa confirmation.`,
      bp,
    );

    // Suivi WhatsApp automatique : la cliente et le prestataire sont prévenus.
    await sendWhatsApp(
      booking.client?.phone,
      clientStatusText({ ...updated, status: BS.EN_ATTENTE_PRESTATAIRE }),
      request.log,
      waParams(booking.client?.name, { ...updated, status: BS.EN_ATTENTE_PRESTATAIRE }),
    );
    await sendWhatsApp(
      provider.phone,
      `Nouvelle mission NAFISSA : « ${label} » à ${booking.location || 'Dakar'}, le ${booking.bookingDate.toISOString().slice(0, 10)}. Connectez-vous à votre espace pour accepter ou refuser.`,
      request.log,
      waParams(provider.name, updated, `Nouvelle mission « ${label} » à ${booking.location || 'Dakar'} le ${booking.bookingDate.toISOString().slice(0, 10)}. Connectez-vous pour accepter ou refuser.`),
    );

    return {
      message: 'Prestataire attribué avec succès.',
      booking: updated,
    };
  });

  fastify.get('/admin/users/pending', { preHandler: pre }, async (request) => {
    const page = Number(request.query?.page) || 1;
    const perPage = 10;

    const where = {
      verified: false,
      role: { in: ['etudiant', 'artisan'] },
      NOT: { profile: { status: 'suspended' } },
    };

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
    if (user.verified && user.profile?.status === 'active') {
      return reply.code(422).send({ message: 'Ce compte est déjà validé.' });
    }

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
    await revokeTokens(id);
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
    await revokeTokens(id);
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
