import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Suivi public d'une demande : pas de compte requis, accessible via le lien
 * de suivi envoyé par WhatsApp. Réponse volontairement limitée (pas de
 * coordonnées, pas de pièces jointes).
 */
export default async function trackingRoutes(fastify) {
  fastify.get('/suivi/:token', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, async (request, reply) => {
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
        duree: booking.duration ?? null,
        lieu: booking.location,
        montant: booking.totalPrice,
        creee_le: booking.createdAt,
        prestataire: booking.provider
          ? { nom: booking.provider.name, note: booking.provider.profile?.rating }
          : null,
      },
    };
  });

  /**
   * La cliente ayant reçu le lien de suivi (WhatsApp) peut définir un mot de
   * passe pour se connecter ensuite avec son numéro de téléphone. Le jeton de
   * suivi (128 bits) tient lieu de vérification d'identité.
   */
  fastify.post('/suivi/:token/password', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const token = String(request.params.token || '');
    if (!/^[a-f0-9]{32}$/.test(token)) {
      return reply.code(404).send({ message: 'Demande introuvable.' });
    }
    const schema = z.object({
      password: z.string().min(8).max(100),
      password_confirmation: z.string(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Choisissez un mot de passe d\'au moins 8 caractères.' });
    }
    if (parsed.data.password !== parsed.data.password_confirmation) {
      return reply.code(422).send({ message: 'La confirmation ne correspond pas.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { trackingToken: token },
      select: { clientId: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Demande introuvable.' });

    await prisma.user.update({
      where: { id: booking.clientId },
      data: { password: await bcrypt.hash(parsed.data.password, 12) },
    });

    return { message: 'Mot de passe défini. Connectez-vous avec votre numéro de téléphone.' };
  });
}
