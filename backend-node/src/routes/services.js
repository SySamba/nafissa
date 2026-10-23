import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { withHiddenProvider } from '../lib/serializers.js';
import { authMiddleware } from '../middleware/auth.js';
import { laravelPaginated, fullResourcePath } from '../lib/pagination.js';
import { geocodeAddress } from '../lib/geocode.js';

const includeList = {
  provider: { include: { profile: true } },
  category: true,
};

function uniqProvidersByUser(rows) {
  const m = new Map();
  for (const row of rows) {
    const k = row.providerId.toString();
    if (!m.has(k)) m.set(k, row);
  }
  return [...m.values()];
}

export default async function serviceRoutes(fastify) {
  fastify.get('/services', async (request) => {
    const q = request.query || {};
    const page = Number(q.page) || 1;
    const perPage = 12;

    const and = [
      { available: true },
      { provider: { verified: true, profile: { status: 'active' } } },
    ];
    if (q.category_id && /^\d+$/.test(String(q.category_id))) {
      and.push({ categoryId: BigInt(q.category_id) });
    }
    // MySQL : les collations par défaut sont déjà insensibles à la casse (`mode` n'existe pas).
    if (q.location) and.push({ location: { contains: String(q.location) } });
    if (q.search) {
      const s = String(q.search);
      and.push({ OR: [{ title: { contains: s } }, { description: { contains: s } }] });
    }
    const priceFilter = {};
    if (q.min_price != null && q.min_price !== '') priceFilter.gte = Number(q.min_price);
    if (q.max_price != null && q.max_price !== '') priceFilter.lte = Number(q.max_price);
    if (Object.keys(priceFilter).length) and.push({ price: priceFilter });

    const where = { AND: and };

    let orderBy = { createdAt: 'desc' };
    const sortBy = q.sort_by || 'created_at';
    const sortDir = q.sort_dir === 'asc' ? 'asc' : 'desc';
    const map = { price: 'price', created_at: 'createdAt', title: 'title' };
    if (map[sortBy]) orderBy = { [map[sortBy]]: sortDir };

    const [total, rows] = await prisma.$transaction([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        include: includeList,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return laravelPaginated(rows.map(withHiddenProvider), total, page, perPage, fullResourcePath(request));
  });

  /** Prestataires vérifiés avec au moins une offre disponible dans la même catégorie (parcours client). */
  fastify.get('/services/:id/category-providers', async (request, reply) => {
    let id;
    try {
      id = BigInt(request.params.id);
    } catch {
      return reply.code(400).send({ message: 'ID invalide.' });
    }

    const base = await prisma.service.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!base) return reply.code(404).send({ message: 'Service introuvable.' });

    const rows = await prisma.service.findMany({
      where: {
        categoryId: base.categoryId,
        available: true,
        provider: {
          verified: true,
          role: { in: ['etudiant', 'artisan'] },
          profile: { status: 'active' },
        },
      },
      include: { provider: { include: { profile: true } }, category: true },
      orderBy: [{ price: 'asc' }, { createdAt: 'desc' }],
    });

    const unique = uniqProvidersByUser(rows);
    const providers = unique.map((s) => ({
      service_id: s.id,
      title: s.title,
      price: s.price,
      location: s.location,
      category: s.category,
      provider: { id: s.provider.id },
    }));

    return { providers };
  });

  fastify.get('/services/:id', async (request, reply) => {
    if (!/^\d+$/.test(String(request.params.id))) {
      return reply.code(400).send({ message: 'ID invalide.' });
    }
    const service = await prisma.service.findUnique({
      where: { id: BigInt(request.params.id) },
      include: includeList,
    });
    if (!service) return reply.code(404).send({ message: 'Service introuvable.' });
    return { service: withHiddenProvider(service) };
  });

  fastify.get('/categories', async () => {
    const categories = await prisma.category.findMany({ where: { active: true } });
    return { categories };
  });

  fastify.post('/services', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      category_id: z.coerce.bigint(),
      title: z.string().max(200),
      description: z.string().max(2000).optional().nullable(),
      price: z.coerce.number().min(0),
      price_unit: z.enum(['heure', 'jour', 'mission', 'forfait']).optional(),
      location: z.string().max(200).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const u = request.user;
    const { category_id, title, description, price, price_unit, location } = parsed.data;
    if (u.role !== 'etudiant' && u.role !== 'artisan') {
      return reply.code(403).send({ message: 'Seuls les prestataires peuvent créer des services.' });
    }
    if (!u.verified) {
      return reply.code(403).send({ message: 'Votre compte doit être validé par un administrateur.' });
    }

    const coords = await geocodeAddress(location);

    const service = await prisma.service.create({
      data: {
        providerId: u.id,
        categoryId: category_id,
        title,
        description: description ?? null,
        price,
        priceUnit: price_unit ?? 'mission',
        location: location ?? null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      },
      include: includeList,
    });

    return reply.code(201).send({
      message: 'Service créé avec succès.',
      service,
    });
  });

  fastify.put('/services/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ message: 'Service introuvable.' });
    if (existing.providerId !== request.user.id) {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }

    const schema = z.object({
      category_id: z.coerce.bigint().optional(),
      title: z.string().max(200).optional(),
      description: z.string().max(2000).optional().nullable(),
      price: z.coerce.number().min(0).optional(),
      price_unit: z.enum(['heure', 'jour', 'mission', 'forfait']).optional(),
      location: z.string().max(200).optional().nullable(),
      available: z.boolean().optional(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Données invalides.' });
    const d = parsed.data;
    const data = {};
    if (d.category_id !== undefined) data.categoryId = d.category_id;
    if (d.title !== undefined) data.title = d.title;
    if (d.description !== undefined) data.description = d.description;
    if (d.price !== undefined) data.price = d.price;
    if (d.price_unit !== undefined) data.priceUnit = d.price_unit;
    if (d.location !== undefined) {
      data.location = d.location;
      const coords = await geocodeAddress(d.location);
      data.lat = coords?.lat ?? null;
      data.lng = coords?.lng ?? null;
    }
    if (d.available !== undefined) data.available = d.available;

    const service = await prisma.service.update({
      where: { id },
      data,
      include: includeList,
    });
    return { message: 'Service mis à jour.', service };
  });

  fastify.delete('/services/:id', { preHandler: authMiddleware }, async (request, reply) => {
    const id = BigInt(request.params.id);
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ message: 'Service introuvable.' });
    if (existing.providerId !== request.user.id) {
      return reply.code(403).send({ message: 'Non autorisé.' });
    }
    await prisma.service.delete({ where: { id } });
    return { message: 'Service supprimé.' };
  });

  fastify.get('/my-services', { preHandler: authMiddleware }, async (request) => {
    const services = await prisma.service.findMany({
      where: { providerId: request.user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return { services };
  });
}
