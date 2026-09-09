import bcrypt from 'bcryptjs';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  composeBearerToken,
  generateSanctumSecret,
  hashSanctumSecret,
} from '../lib/sanctum.js';
import { TOKENABLE_TYPE } from '../lib/auth-resolve.js';
import { notify } from '../lib/notifications.js';
import { stripUser, userWithProfile } from '../lib/serializers.js';
import { authMiddleware } from '../middleware/auth.js';

function collectPhoneVariants(input) {
  const raw = String(input || '').trim();
  const noSpace = raw.replace(/\s/g, '');
  const digitsOnly = raw.replace(/\D/g, '');
  /** @type {Set<string>} */
  const variants = new Set([raw, noSpace].filter(Boolean));
  if (digitsOnly.length >= 8) {
    variants.add(digitsOnly);
    if (digitsOnly.length === 9) variants.add(`+221${digitsOnly}`);
    if (digitsOnly.startsWith('221') && digitsOnly.length > 3) variants.add(`+${digitsOnly}`);
    if (!digitsOnly.startsWith('221') && digitsOnly.length >= 9) {
      variants.add(`+221${digitsOnly.slice(-9)}`);
    }
  }
  return [...variants];
}

async function findUserByLoginIdentifier(identifier) {
  const id = String(identifier || '').trim();
  if (!id) return null;
  if (id.includes('@')) {
    const email = id.toLowerCase();
    return prisma.user.findUnique({ where: { email } });
  }
  const variants = collectPhoneVariants(id);
  const orPhone = variants.map((phone) => ({ phone }));
  if (orPhone.length === 0) return null;
  return prisma.user.findFirst({
    where: { OR: orPhone },
  });
}

/** Accepte un tableau JSON, une chaîne « 1,2,3 » ou une valeur unique. */
const categoryIdsSchema = z.preprocess((val) => {
  if (val == null || val === '') return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        return trimmed.split(',');
      }
    }
    return trimmed.split(',');
  }
  return [val];
}, z.array(z.union([z.string(), z.number()])).max(8).optional());

const registerJsonSchema = z.object({
  name: z.string().max(100),
  email: z.string().email().max(150),
  password: z.string().min(8),
  password_confirmation: z.string(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  role: z.enum(['maman', 'etudiant', 'artisan']),
  gender: z.enum(['homme', 'femme']).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  category_ids: categoryIdsSchema,
});

/** Crée des services « brouillon » (non publiés) pour les catégories choisies à l'inscription. */
async function createDraftServicesForProvider(user, categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return;
  const ids = [];
  for (const raw of categoryIds) {
    try {
      ids.push(BigInt(String(raw).trim()));
    } catch {
      // ignore les identifiants non numériques
    }
  }
  if (ids.length === 0) return;

  const categories = await prisma.category.findMany({
    where: { id: { in: ids }, active: true },
  });
  if (categories.length === 0) return;

  await prisma.service.createMany({
    data: categories.map((c) => ({
      providerId: user.id,
      categoryId: c.id,
      title: c.name,
      description: null,
      price: 0,
      location: user.address || null,
      available: false,
    })),
  });
}

async function savePart(part, subdir) {
  if (!part || part.type !== 'file') return null;
  const root =
    process.env.STORAGE_PATH ||
    path.join(process.cwd(), '..', 'backend', 'storage', 'app', 'public');
  const ext = path.extname(part.filename || '') || '.bin';
  const name = randomBytes(16).toString('hex') + ext;
  const dir = path.join(root, subdir);
  await mkdir(dir, { recursive: true });
  const buf = await part.toBuffer();
  await writeFile(path.join(dir, name), buf);
  return `${subdir}/${name}`;
}

export default async function authRoutes(fastify) {
  fastify.post('/auth/register', async (request, reply) => {
    const isMultipart = request.isMultipart();
    let body = {};
    const files = { photo: null, id_card_recto: null, id_card_verso: null };

    if (isMultipart) {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          if (['photo', 'id_card_recto', 'id_card_verso'].includes(part.fieldname)) {
            files[part.fieldname] = part;
          }
        } else {
          body[part.fieldname] = part.value;
        }
      }
    } else {
      body = request.body || {};
    }

    const parsed = registerJsonSchema.safeParse(body);
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Données invalides.', errors: parsed.error.flatten() });
    }
    const v = parsed.data;
    if (v.password !== v.password_confirmation) {
      return reply.code(422).send({ message: 'La confirmation du mot de passe ne correspond pas.' });
    }

    // Normalisation : on stocke l'email en minuscules pour que la connexion
    // (qui compare en minuscules) retrouve toujours le compte. Évite « identifiants incorrects ».
    const email = v.email.trim().toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return reply.code(422).send({ message: 'Cet email est déjà utilisé.' });
    }

    let photoPath = null;
    let idRecto = null;
    let idVerso = null;
    if (files.photo) photoPath = await savePart(files.photo, 'photos');
    if (files.id_card_recto) idRecto = await savePart(files.id_card_recto, 'id_cards');
    if (files.id_card_verso) idVerso = await savePart(files.id_card_verso, 'id_cards');

    const hashed = await bcrypt.hash(v.password, 12);
    const verified = v.role === 'maman';

    const dob = v.date_of_birth ? new Date(v.date_of_birth) : null;

    const user = await prisma.user.create({
      data: {
        name: v.name,
        email,
        password: hashed,
        phone: v.phone || null,
        address: v.address || null,
        gender: v.gender || undefined,
        dateOfBirth: dob && !Number.isNaN(dob.getTime()) ? dob : null,
        role: v.role,
        verified,
        photo: photoPath,
        idCardRecto: idRecto,
        idCardVerso: idVerso,
        profile: {
          create: {
            status: v.role === 'maman' ? 'active' : 'pending',
          },
        },
      },
      include: { profile: true },
    });

    if (v.role === 'etudiant' || v.role === 'artisan') {
      try {
        await createDraftServicesForProvider(user, v.category_ids);
      } catch (err) {
        request.log?.warn?.({ err }, 'création des services brouillon échouée');
      }
    }

    await notify(user.id, 'account', 'Bienvenue sur Nafissa !', 'Votre compte a été créé avec succès.', '/dashboard');

    const secret = generateSanctumSecret();
    const tokenRow = await prisma.personalAccessToken.create({
      data: {
        name: 'auth-token',
        token: hashSanctumSecret(secret),
        tokenableType: TOKENABLE_TYPE,
        tokenableId: user.id,
        abilities: ['*'],
      },
    });
    const plain = composeBearerToken(tokenRow.id.toString(), secret);

    return reply.code(201).send({
      message: 'Inscription réussie.',
      user: stripUser(user),
      token: plain,
    });
  });

  fastify.post('/auth/login', async (request, reply) => {
    const schema = z
      .object({
        login: z.string().min(3).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        password: z.string().min(1),
      })
      .transform((body) => {
        const identifier = (body.login || body.email || body.phone || '').trim();
        return { identifier, password: body.password };
      });

    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success || !parsed.data.identifier) {
      return reply.code(422).send({ message: 'Saisissez votre email ou numéro de téléphone.' });
    }
    const { identifier, password } = parsed.data;
    const user = await findUserByLoginIdentifier(identifier);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ message: 'Identifiants incorrects.' });
    }

    await prisma.personalAccessToken.deleteMany({
      where: { tokenableType: TOKENABLE_TYPE, tokenableId: user.id },
    });

    const secret = generateSanctumSecret();
    const tokenRow = await prisma.personalAccessToken.create({
      data: {
        name: 'auth-token',
        token: hashSanctumSecret(secret),
        tokenableType: TOKENABLE_TYPE,
        tokenableId: user.id,
        abilities: ['*'],
      },
    });
    const u = await userWithProfile(user.id);
    const plain = composeBearerToken(tokenRow.id.toString(), secret);

    return reply.send({
      message: 'Connexion réussie.',
      user: stripUser(u),
      token: plain,
    });
  });

  fastify.post('/auth/logout', { preHandler: authMiddleware }, async (request, reply) => {
    await prisma.personalAccessToken.delete({ where: { id: request.accessToken.id } });
    return reply.send({ message: 'Déconnexion réussie.' });
  });

  fastify.get('/auth/me', { preHandler: authMiddleware }, async (request, reply) => {
    const u = await userWithProfile(request.user.id);
    return reply.send({ user: stripUser(u) });
  });

  fastify.put('/auth/profile', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      name: z.string().max(100).optional(),
      phone: z.string().max(20).optional().nullable(),
      address: z.string().max(255).optional().nullable(),
      bio: z.string().max(1000).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Données invalides.' });
    }
    const d = parsed.data;
    const userData = {};
    if (d.name !== undefined) userData.name = d.name;
    if (d.phone !== undefined) userData.phone = d.phone;
    if (d.address !== undefined) userData.address = d.address;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length) {
        await tx.user.update({ where: { id: request.user.id }, data: userData });
      }
      if (d.bio !== undefined) {
        await tx.profile.updateMany({
          where: { userId: request.user.id },
          data: { bio: d.bio },
        });
      }
    });

    const u = await userWithProfile(request.user.id);
    return reply.send({ message: 'Profil mis à jour avec succès.', user: stripUser(u) });
  });
}
