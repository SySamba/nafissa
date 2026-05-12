import { randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { BS, COMMISSION_RATE, ES, PS } from '../lib/constants.js';
import { notify, bookingDetailPath } from '../lib/notifications.js';
import { authMiddleware } from '../middleware/auth.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';

function transactionRef() {
  const rand = randomBytes(6).toString('hex').toUpperCase();
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `NAF-${rand}-${ymd}`;
}

export default async function paymentRoutes(fastify) {
  fastify.post('/payments', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      booking_id: z.coerce.bigint(),
      method: z.enum(['orange_money', 'wave', 'free_money', 'stripe']),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const { booking_id, method } = parsed.data;
    const user = request.user;

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { service: true, provider: true },
    });
    if (!booking) return reply.code(422).send({ message: "Cette réservation n'existe pas." });
    if (booking.clientId !== user.id) return reply.code(403).send({ message: 'Non autorisé.' });
    if (booking.status !== BS.ACCEPTEE) {
      return reply.code(422).send({ message: 'La réservation doit être acceptée avant le paiement.' });
    }

    const existing = await prisma.payment.findUnique({ where: { bookingId: booking_id } });
    if (existing) return reply.code(422).send({ message: 'Un paiement existe déjà pour cette réservation.' });

    const amount = booking.totalPrice;
    const commission = Math.round(Number(amount) * COMMISSION_RATE * 100) / 100;

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          commission,
          method,
          status: PS.COMPLETED,
          escrowStatus: ES.HELD,
          transactionRef: transactionRef(),
        },
        include: { booking: { include: { service: true } } },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BS.EN_COURS },
      }),
    ]);

    const payPath = bookingDetailPath(booking.id);

    await notify(
      user.id,
      'payment',
      'Paiement confirmé',
      `Votre paiement de ${amount} FCFA pour « ${booking.service.title} » est sécurisé.`,
      payPath,
    );
    if (booking.providerId) {
      await notify(
        booking.providerId,
        'payment',
        'Paiement reçu (escrow)',
        `Le paiement pour « ${booking.service.title} » est sécurisé en attente de validation.`,
        payPath,
      );
    }

    const full = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { booking: { include: { service: true } } },
    });

    return reply.code(201).send({
      message: 'Paiement effectué avec succès.',
      payment: full,
    });
  });

  fastify.patch('/payments/:id/release', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const user = request.user;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: { include: { service: true } } },
    });
    if (!payment) return reply.code(404).send({ message: 'Non trouvé.' });
    const booking = payment.booking;

    if (booking.clientId !== user.id && user.role !== 'admin') {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }
    if (payment.escrowStatus !== ES.HELD) {
      return reply.code(422).send({ message: 'Ce paiement a déjà été libéré.' });
    }
    if (booking.status !== BS.TERMINEE) {
      return reply.code(422).send({ message: 'La mission doit être terminée avant de libérer le paiement.' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { escrowStatus: ES.RELEASED },
      include: { booking: { include: { service: true } } },
    });

    const netAmount = Number(updated.amount) - Number(updated.commission);
    if (booking.providerId) {
      await notify(
        booking.providerId,
        'payment',
        'Paiement libéré',
        `Vous avez reçu ${netAmount} FCFA pour « ${booking.service.title} ».`,
        bookingDetailPath(booking.id),
      );
    }

    return {
      message: 'Paiement libéré au prestataire.',
      payment: updated,
    };
  });

  fastify.get('/payments/history', { preHandler: authMiddleware }, async (request) => {
    const user = request.user;
    const page = Number(request.query?.page) || 1;
    const perPage = 10;

    const where = {
      booking: {
        OR: [{ clientId: user.id }, { providerId: user.id }],
      },
    };

    const [total, rows] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: { booking: { include: { service: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return laravelPaginated(rows, total, page, perPage, fullResourcePath(request));
  });
}
