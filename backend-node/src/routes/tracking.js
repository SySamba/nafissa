import { prisma } from '../lib/prisma.js';

/**
 * Suivi public d'une demande : pas de compte requis, accessible via le lien
 * de suivi envoyé par WhatsApp. Réponse volontairement limitée (pas de
 * coordonnées, pas de pièces jointes).
 */
export default async function trackingRoutes(fastify) {
  fastify.get('/suivi/:token', async (request, reply) => {
    const token = String(request.params.token || '');
    if (!/^[a-f0-9]{32}$/.test(token)) {
      return reply.code(404).send({ message: 'Demande introuvable.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { trackingToken: token },
      include: {
        service: { include: { category: true } },
        category: true,
        provider: { include: { profile: true } },
      },
    });
    if (!booking) return reply.code(404).send({ message: 'Demande introuvable.' });

    return {
      demande: {
        numero: booking.id.toString(),
        status: booking.status,
        service: booking.service?.title ?? null,
        categorie: booking.service?.category?.name ?? booking.category?.name ?? null,
        date: booking.bookingDate.toISOString().slice(0, 10),
        heure: booking.bookingTime.toISOString().slice(11, 16),
        lieu: booking.location,
        montant: booking.totalPrice,
        creee_le: booking.createdAt,
        prestataire: booking.provider
          ? { nom: booking.provider.name, note: booking.provider.profile?.rating }
          : null,
      },
    };
  });
}
