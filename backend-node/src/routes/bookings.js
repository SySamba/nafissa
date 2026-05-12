import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { BS } from '../lib/constants.js';
import { notify, notifyAdmins, bookingDetailPath } from '../lib/notifications.js';
import { authMiddleware } from '../middleware/auth.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';

const bookingInclude = {
  service: { include: { category: true } },
  client: { include: { profile: true } },
  provider: { include: { profile: true } },
  payment: true,
};

function parseBookingTime(t) {
  const [h, m, s] = t.split(':').map((x) => Number(x));
  return new Date(Date.UTC(1970, 0, 1, h || 0, m || 0, s || 0));
}

function isMaman(role) {
  return role === 'maman';
}
function isPrestataire(role) {
  return role === 'etudiant' || role === 'artisan';
}
function isAdmin(role) {
  return role === 'admin';
}

function canTransition(user, booking, newStatus) {
  if (isAdmin(user.role)) return true;

  const providerTransitions = {
    [BS.EN_ATTENTE_PRESTATAIRE]: [BS.ACCEPTEE, BS.REFUSEE],
    [BS.PAYEE]: [BS.EN_COURS],
    [BS.EN_COURS]: [BS.TERMINEE],
  };
  const clientTransitions = {
    [BS.EN_ATTENTE_ADMIN]: [BS.ANNULEE],
    [BS.EN_ATTENTE_PRESTATAIRE]: [BS.ANNULEE],
    [BS.EN_COURS]: [BS.TERMINEE],
  };

  if (booking.providerId && user.id === booking.providerId) {
    const allowed = providerTransitions[booking.status] ?? [];
    return allowed.includes(newStatus);
  }
  if (user.id === booking.clientId) {
    const allowed = clientTransitions[booking.status] ?? [];
    return allowed.includes(newStatus);
  }
  return false;
}

export default async function bookingRoutes(fastify) {
  fastify.post('/bookings', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      service_id: z.coerce.bigint(),
      booking_date: z.string(),
      booking_time: z.string().regex(/^\d{2}:\d{2}$/),
      notes: z.string().max(1000).optional().nullable(),
      location: z.string().max(255).optional().nullable(),
      description: z.string().max(2000).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const v = parsed.data;
    const user = request.user;
    const service = await prisma.service.findUnique({ where: { id: v.service_id } });
    if (!service) return reply.code(422).send({ message: "Ce service n'existe pas." });
    if (!service.available) return reply.code(422).send({ message: "Ce service n'est pas disponible." });

    const bd = new Date(v.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bd < today) {
      return reply.code(422).send({ message: "La date doit être aujourd'hui ou ultérieure." });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        providerId: null,
        serviceId: service.id,
        status: BS.EN_ATTENTE_ADMIN,
        bookingDate: bd,
        bookingTime: parseBookingTime(v.booking_time),
        totalPrice: service.price,
        notes: v.notes ?? null,
        location: v.location ?? user.address,
        description: v.description ?? null,
      },
      include: bookingInclude,
    });

    await notifyAdmins(
      'booking',
      'Nouvelle demande de service',
      `${user.name} a fait une demande pour « ${booking.service.title} ».`,
      bookingDetailPath(booking.id),
    );

    return reply.code(201).send({
      message:
        "Demande envoyée avec succès. L'administrateur va attribuer un prestataire.",
      booking,
    });
  });

  fastify.get('/bookings', { preHandler: authMiddleware }, async (request) => {
    const user = request.user;
    const page = Number(request.query?.page) || 1;
    const perPage = 10;

    const roleWhere = isMaman(user.role)
      ? { clientId: user.id }
      : isPrestataire(user.role)
        ? { providerId: user.id }
        : {};

    const where = isAdmin(user.role) ? {} : roleWhere;

    const [total, rows] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return laravelPaginated(rows, total, page, perPage, fullResourcePath(request));
  });

  fastify.get('/bookings/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    const u = request.user;
    if (booking.clientId !== u.id && booking.providerId !== u.id && !isAdmin(u.role)) {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }
    return { booking };
  });

  fastify.patch('/bookings/:id/status', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      status: z.enum(['acceptee', 'refusee', 'en_cours', 'terminee', 'annulee']),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Statut invalide.' });
    const newStatus = parsed.data.status;
    const id = BigInt(request.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    if (!canTransition(request.user, booking, newStatus)) {
      return reply.code(403).send({ message: 'Transition de statut non autorisée.' });
    }

    if (newStatus === BS.REFUSEE) {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: BS.EN_ATTENTE_ADMIN, providerId: null },
        include: bookingInclude,
      });
      await notifyAdmins(
        'booking',
        'Prestataire a refusé la mission',
        `Le prestataire a refusé la mission pour « ${updated.service.title} ». Veuillez attribuer un autre prestataire.`,
        bookingDetailPath(updated.id),
      );
      return {
        message: `Mission refusée. L'administrateur va attribuer un autre prestataire.`,
        booking: updated,
      };
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: bookingInclude,
    });

    await sendStatusNotifications(updated, newStatus);

    return { message: 'Statut mis à jour.', booking: updated };
  });

  fastify.post('/bookings/:id/rate', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const schema = z.object({
      rating: z.number().int().min(1).max(5),
      review: z.string().max(1000).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, provider: { include: { profile: true } }, client: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Non trouvé.' });
    if (booking.clientId !== request.user.id) {
      return reply.code(403).send({ message: 'Seul le client peut noter cette réservation.' });
    }
    if (booking.status !== BS.TERMINEE) {
      return reply.code(422).send({ message: 'La mission doit être terminée pour pouvoir noter.' });
    }
    if (booking.rating != null) {
      return reply.code(422).send({ message: 'Vous avez déjà noté cette réservation.' });
    }

    const { rating, review } = parsed.data;
    const updated = await prisma.booking.update({
      where: { id },
      data: { rating, review: review ?? null },
      include: bookingInclude,
    });

    if (booking.providerId) {
      const avg = await prisma.booking.aggregate({
        where: { providerId: booking.providerId, rating: { not: null } },
        _avg: { rating: true },
      });
      const r = Math.round((avg._avg.rating ?? rating) * 10) / 10;
      await prisma.profile.updateMany({
        where: { userId: booking.providerId },
        data: { rating: r },
      });
    }

    if (booking.providerId) {
      const provider = await prisma.user.findUnique({ where: { id: booking.providerId } });
      if (provider) {
        await notify(
          provider.id,
          'booking',
          'Nouvelle évaluation reçue',
          `${request.user.name} vous a attribué ${rating}/5 pour « ${booking.service.title} ».`,
          bookingDetailPath(booking.id),
        );
      }
    }

    return reply.send({
      message: 'Merci pour votre évaluation !',
      booking: updated,
    });
  });
}

async function sendStatusNotifications(booking, newStatus) {
  const serviceName = booking.service?.title || 'Service';
  const path = bookingDetailPath(booking.id);
  const messages = {
    [BS.ACCEPTEE]: {
      targetId: booking.clientId,
      title: 'Mission acceptée par le prestataire',
      message: `Votre demande pour « ${serviceName} » a été acceptée. Veuillez procéder au paiement.`,
    },
    [BS.EN_COURS]: {
      targetId: booking.clientId,
      title: 'Mission en cours',
      message: `La mission pour « ${serviceName} » a démarré.`,
    },
    [BS.TERMINEE]: {
      multi: [booking.clientId, booking.providerId].filter(Boolean),
      title: 'Mission terminée',
      message: `La mission pour « ${serviceName} » est terminée.`,
    },
    [BS.ANNULEE]: {
      multi: [booking.providerId, booking.clientId].filter(Boolean),
      title: 'Réservation annulée',
      message: `La réservation pour « ${serviceName} » a été annulée.`,
    },
  };

  const m = messages[newStatus];
  if (!m) return;
  if (m.multi) {
    for (const uid of m.multi) {
      await notify(uid, 'booking', m.title, m.message, path);
    }
  } else if (m.targetId) {
    await notify(m.targetId, 'booking', m.title, m.message, path);
  }
}
