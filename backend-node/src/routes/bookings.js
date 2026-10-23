import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { BS } from '../lib/constants.js';
import { notify, notifyAdmins, bookingDetailPath } from '../lib/notifications.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';
import { sendWhatsApp, clientStatusText, trackingLink, waParams } from '../lib/whatsapp-send.js';
import { geocodeAddress } from '../lib/geocode.js';
import { bookingForViewer, bookingLabel } from '../lib/serializers.js';

const bookingInclude = {
  service: { include: { category: true } },
  category: true,
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

/**
 * Variantes normalisées d'un numéro saisi par un invité
 * (local 9 chiffres, indicatif 221, formats avec/sans espaces).
 */
function guestPhoneVariants(phone) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  const variants = new Set([raw, digits].filter(Boolean));
  if (digits.length === 9) variants.add(`+221${digits}`);
  if (digits.startsWith('221')) variants.add(`+${digits}`);
  return [...variants];
}

/**
 * Rattache la demande à un compte cliente existant (même numéro)
 * ou crée un compte invité minimal que l'équipe pourra recontacter.
 */
async function findOrCreateGuestClient(name, phone, location) {
  const variants = guestPhoneVariants(phone);
  const existing = await prisma.user.findFirst({
    where: { role: 'maman', OR: variants.map((p) => ({ phone: p })) },
  });
  if (existing) return { client: existing, isGuest: false };

  const client = await prisma.user.create({
    data: {
      name,
      email: `invite-${Date.now()}-${randomBytes(4).toString('hex')}@nafissa.local`,
      phone: String(phone).trim(),
      address: location || null,
      password: await bcrypt.hash(randomBytes(16).toString('hex'), 12),
      role: 'maman',
      verified: true,
      profile: { create: { status: 'active' } },
    },
  });
  return { client, isGuest: true };
}

export default async function bookingRoutes(fastify) {
  // Demande rapide : ouverte aux invités (nom + téléphone) comme aux clientes connectées.
  fastify.post('/bookings', { preHandler: optionalAuthMiddleware }, async (request, reply) => {
    const schema = z.object({
      service_id: z.coerce.bigint().optional().nullable(),
      category_id: z.coerce.bigint().optional().nullable(),
      booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      booking_time: z.string().regex(/^\d{2}:\d{2}$/),
      duration: z.string().max(80).optional().nullable(),
      notes: z.string().max(1000).optional().nullable(),
      location: z.string().max(255).optional().nullable(),
      description: z.string().max(2000).optional().nullable(),
      guest_name: z.string().max(100).optional().nullable(),
      guest_phone: z.string().max(30).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const v = parsed.data;

    let client = request.user;
    let isGuest = false;
    if (!client) {
      const name = (v.guest_name || '').trim();
      const phone = (v.guest_phone || '').trim();
      if (name.length < 2) {
        return reply.code(422).send({ message: 'Indiquez votre nom complet.' });
      }
      if (phone.replace(/\D/g, '').length < 8) {
        return reply.code(422).send({ message: 'Indiquez un numéro de téléphone valide.' });
      }
      const found = await findOrCreateGuestClient(name, phone, v.location);
      client = found.client;
      isGuest = found.isGuest;
    }

    if (!v.service_id && !v.category_id) {
      return reply.code(422).send({ message: 'Indiquez un service ou une catégorie de besoin.' });
    }

    // Deux parcours : annonce précise (service_id) ou simple catégorie de
    // besoin — dans les deux cas l'équipe attribue ensuite le prestataire.
    let service = null;
    let categoryId = null;
    if (v.service_id) {
      service = await prisma.service.findUnique({ where: { id: v.service_id } });
      if (!service) return reply.code(422).send({ message: "Ce service n'existe pas." });
      if (!service.available) return reply.code(422).send({ message: "Ce service n'est pas disponible." });
      categoryId = service.categoryId;
    } else {
      const category = await prisma.category.findUnique({ where: { id: v.category_id } });
      if (!category?.active) return reply.code(422).send({ message: "Cette catégorie n'existe pas." });
      categoryId = category.id;
    }

    const bd = new Date(v.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bd < today) {
      return reply.code(422).send({ message: "La date doit être aujourd'hui ou ultérieure." });
    }

    // Géocodage du lieu d'intervention : quartier local ou OpenStreetMap.
    const coords = await geocodeAddress(v.location ?? client.address);

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        providerId: null,
        serviceId: service?.id ?? null,
        categoryId,
        trackingToken: randomBytes(16).toString('hex'),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        status: BS.EN_ATTENTE_ADMIN,
        bookingDate: bd,
        bookingTime: parseBookingTime(v.booking_time),
        duration: v.duration ?? null,
        totalPrice: service?.price ?? null,
        notes: v.notes ?? null,
        location: v.location ?? client.address,
        description: v.description ?? null,
      },
      include: bookingInclude,
    });

    const contact = client.phone ? ` (tél : ${client.phone})` : '';
    await notifyAdmins(
      'booking',
      isGuest ? 'Demande rapide (sans compte)' : 'Nouvelle demande de service',
      `${client.name}${contact} a fait une demande pour « ${bookingLabel(booking)} ».`,
      bookingDetailPath(booking.id),
    );

    // Suivi automatique par WhatsApp (si l'API Meta est configurée).
    await sendWhatsApp(
      client.phone,
      `Bonjour ${client.name},\n\nVotre demande NAFISSA n°${booking.id} — « ${bookingLabel(booking)} » a bien été reçue. Notre équipe sélectionne le meilleur prestataire disponible près de chez vous.\n\nSuivez-la en temps réel : ${trackingLink(booking.trackingToken)}\n\n— L'équipe NAFISSA`,
      request.log,
      waParams(client.name, booking, `« ${bookingLabel(booking)} » a bien été reçue. Notre équipe sélectionne le meilleur prestataire disponible près de chez vous.`),
    );

    return reply.code(201).send({
      message: isGuest
        ? 'Demande envoyée ! Notre équipe vous recontactera par téléphone pour la suite.'
        : "Demande envoyée avec succès. L'administrateur va attribuer un prestataire.",
      booking,
      tracking_token: booking.trackingToken,
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

    const data = rows.map((b) => bookingForViewer(b, user));
    return laravelPaginated(data, total, page, perPage, fullResourcePath(request));
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
    return { booking: bookingForViewer(booking, u) };
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
      // On mémorise qui a refusé : la demande repasse en attente admin mais
      // ce prestataire sera signalé dans les prochaines suggestions.
      const prevRefusals = Array.isArray(booking.refusedBy) ? booking.refusedBy.map(String) : [];
      const refusedBy = [...new Set([...prevRefusals, String(booking.providerId)])];
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: BS.EN_ATTENTE_ADMIN, providerId: null, refusedBy },
        include: bookingInclude,
      });
      const link = bookingDetailPath(updated.id);
      await notifyAdmins(
        'booking',
        'Prestataire a refusé la mission',
        `Le prestataire a refusé la mission pour « ${bookingLabel(updated)} ». Veuillez attribuer un autre prestataire.`,
        link,
      );
      await notify(
        updated.clientId,
        'booking',
        'Nous cherchons un autre prestataire',
        `Le prestataire choisi pour « ${bookingLabel(updated)} » n'est pas disponible. Notre équipe vous attribue un autre prestataire.`,
        link,
      );
      await sendWhatsApp(
        updated.client?.phone,
        `Bonjour${updated.client?.name ? ` ${updated.client.name}` : ''},\n\nLe prestataire choisi pour votre demande NAFISSA n°${updated.id} — « ${bookingLabel(updated)} » n'est pas disponible. Notre équipe vous attribue un autre prestataire.\n\nSuivi : ${trackingLink(updated.trackingToken)}\n\n— L'équipe NAFISSA`,
        request.log,
        waParams(updated.client?.name, updated, `« ${bookingLabel(updated)} » — le prestataire choisi n'est pas disponible. Notre équipe vous attribue un autre prestataire.`),
      );
      return {
        message: `Mission refusée. L'administrateur va attribuer un autre prestataire.`,
        booking: bookingForViewer(updated, request.user),
      };
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: bookingInclude,
    });

    await sendStatusNotifications(updated, newStatus);

    return { message: 'Statut mis à jour.', booking: bookingForViewer(updated, request.user) };
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
          `${request.user.name} vous a attribué ${rating}/5 pour « ${bookingLabel(booking)} ».`,
          bookingDetailPath(booking.id),
        );
      }
    }

    return reply.send({
      message: 'Merci pour votre évaluation !',
      booking: bookingForViewer(updated, request.user),
    });
  });

  /** Signaler un problème (litige) sur une réservation. */
  fastify.post('/bookings/:id/dispute', { preHandler: authMiddleware }, async (request, reply) => {
    let id;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.code(400).send({ message: 'Identifiant invalide.' });
    }
    const schema = z.object({
      reason: z.string().max(120).optional().nullable(),
      message: z.string().min(5).max(2000),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Merci de décrire le problème (au moins 5 caractères).' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, client: true, provider: true },
    });
    if (!booking) return reply.code(404).send({ message: 'Réservation introuvable.' });

    const u = request.user;
    const isParty = booking.clientId === u.id || booking.providerId === u.id;
    if (!isParty && u.role !== 'admin') {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }

    const reason = parsed.data.reason?.trim() || 'Problème signalé';
    const serviceName = bookingLabel(booking);
    const link = bookingDetailPath(booking.id);

    await notifyAdmins(
      'dispute',
      `Litige · ${reason}`,
      `${u.name} a signalé un problème sur « ${serviceName} » (demande #${booking.id}) : ${parsed.data.message}`,
      link,
    );
    await notify(
      u.id,
      'dispute',
      'Signalement bien reçu',
      `Votre signalement concernant « ${serviceName} » a été transmis à l'équipe NAFISSA. Nous revenons vers vous au plus vite.`,
      link,
    );

    return reply.send({ message: 'Votre signalement a été envoyé à notre équipe. Merci.' });
  });
}

async function sendStatusNotifications(booking, newStatus) {
  const serviceName = bookingLabel(booking);
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

  // Suivi automatique par WhatsApp vers la cliente à chaque changement de statut.
  await sendWhatsApp(booking.client?.phone, clientStatusText(booking), undefined, waParams(booking.client?.name, booking));
}
