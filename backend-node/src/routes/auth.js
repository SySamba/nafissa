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
});

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
    let files = { photo: null, id_card_recto: null, id_card_verso: null };

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

    const exists = await prisma.user.findUnique({ where: { email: v.email } });
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
        email: v.email,
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
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Identifiants incorrects.' });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findFirst({ where: { email } });
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
