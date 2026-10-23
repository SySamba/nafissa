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
import { geocodeAddress } from '../lib/geocode.js';

/**
 * Forme canonique d'un numéro sénégalais : « +221 » + 9 chiffres locaux.
 * Reconnu : 9 chiffres nus, « 221XXXXXXXXX », « +221XXXXXXXXX », « 00221XXXXXXXXX ».
 * Renvoie null si le format n'est pas reconnu (numéro étranger, saisie libre).
 */
function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 9) return `+221${digits}`;
  if (digits.startsWith('00221') && digits.length === 14) return `+221${digits.slice(5)}`;
  if (digits.startsWith('221') && digits.length === 12) return `+${digits}`;
  return null;
}

/**
 * Toutes les formes sous lesquelles un numéro peut avoir été stocké
 * (données historiques non normalisées incluses).
 */
function collectPhoneVariants(input) {
  const raw = String(input || '').trim();
  const variants = new Set([raw, raw.replace(/\s/g, '')].filter(Boolean));
  const normalized = normalizePhone(raw);
  if (normalized) {
    const local = normalized.slice(4); // 9 chiffres locaux
    variants.add(normalized); // +221XXXXXXXXX
    variants.add(`221${local}`); // 221XXXXXXXXX
    variants.add(local); // XXXXXXXXX
    variants.add(`00221${local}`); // 00221XXXXXXXXX
  }
  return [...variants];
}

async function findUsersByLoginIdentifier(identifier) {
  const id = String(identifier || '').trim();
  if (!id) return [];
  if (id.includes('@')) {
    const email = id.toLowerCase();
    // Plusieurs comptes peuvent partager le même email (client + prestataire) :
    // on les teste tous, le mot de passe départage.
    return prisma.user.findMany({ where: { email } });
  }
  const variants = collectPhoneVariants(id);
  const orPhone = variants.map((phone) => ({ phone }));
  // Numéro étranger saisi sans indicatif : correspondance par suffixe sur les
  // numéros stockés au format international (+225…, +33…).
  const digits = id.replace(/\D/g, '');
  if (digits.length >= 8 && !id.includes('+')) {
    orPhone.push({ phone: { endsWith: digits } });
  }
  if (orPhone.length === 0) return [];
  // Plusieurs comptes peuvent partager le même numéro : on les teste tous.
  return prisma.user.findMany({
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

/** Détecte le vrai type d'un fichier par ses octets de signature. */
function sniffMime(buf) {
  if (!buf || buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buf.subarray(8, 12).toString('latin1') === 'WEBP'
  ) return 'image/webp';
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return 'application/pdf';
  return null;
}

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

async function savePart(part, subdir) {
  if (!part || !part.buffer) return null;
  // Ni le nom de fichier ni le mimetype déclaré ne sont fiables : on n'accepte
  // que des contenus réellement image (ou PDF pour les pièces d'identité) et
  // l'extension stockée est dérivée du type détecté.
  const mime = sniffMime(part.buffer);
  const allowed = part.fieldname === 'photo'
    ? mime && mime !== 'application/pdf'
    : !!mime;
  if (!mime || !allowed) {
    throw Object.assign(
      new Error('Format de fichier non pris en charge (JPG, PNG, WebP ou PDF uniquement).'),
      { statusCode: 422 },
    );
  }
  const root =
    process.env.STORAGE_PATH ||
    path.join(process.cwd(), '..', 'backend', 'storage', 'app', 'public');
  const name = randomBytes(16).toString('hex') + MIME_EXT[mime];
  const dir = path.join(root, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), part.buffer);
  return `${subdir}/${name}`;
}

export default async function authRoutes(fastify) {
  fastify.post('/auth/register', {
    config: { rateLimit: { max: 15, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const isMultipart = request.isMultipart();
    let body = {};
    const files = { photo: null, id_card_recto: null, id_card_verso: null };

    if (isMultipart) {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          // Le flux doit être consommé immédiatement, sinon l'itérateur
          // multipart attend la fin du fichier avant de livrer la partie suivante
          // et la requête tourne indéfiniment.
          const buffer = await part.toBuffer();
          if (['photo', 'id_card_recto', 'id_card_verso'].includes(part.fieldname)) {
            files[part.fieldname] = { buffer, filename: part.filename, fieldname: part.fieldname };
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

    // Normalisation : le téléphone est stocké sous forme canonique
    // « +221XXXXXXXXX » pour que la connexion le retrouve quel que soit le
    // format saisi. Les formats non reconnus sont conservés tels quels.
    const phone = v.phone ? normalizePhone(v.phone) || v.phone.trim() : null;

    // Unicité par couple (email, rôle) : une même personne peut avoir un
    // compte client et un compte prestataire avec le même email.
    const exists = await prisma.user.findFirst({ where: { email, role: v.role } });
    if (exists) {
      return reply.code(422).send({ message: 'Cet email est déjà utilisé pour ce type de compte.' });
    }

    // Revendication : si une demande rapide a créé un compte invité avec ce
    // numéro, on le transforme en compte réel au lieu d'en créer un doublon.
    // Fait avant le contrôle d'unicité du téléphone pour ne pas se bloquer soi-même.
    let guestAccount = null;
    if (v.role === 'maman' && phone) {
      const variants = collectPhoneVariants(phone);
      guestAccount = await prisma.user.findFirst({
        where: {
          role: 'maman',
          email: { endsWith: '@nafissa.local' },
          OR: variants.map((p) => ({ phone: p })),
        },
      });
    }

    // Unicité du téléphone par rôle : deux comptes du même type ne peuvent
    // pas partager le même numéro (le compte invité revendiqué est exclu).
    if (phone) {
      const phoneTaken = await prisma.user.findFirst({
        where: {
          role: v.role,
          id: guestAccount ? { not: guestAccount.id } : undefined,
          OR: collectPhoneVariants(phone).map((p) => ({ phone: p })),
        },
      });
      if (phoneTaken) {
        return reply.code(422).send({ message: 'Ce numéro est déjà utilisé pour ce type de compte.' });
      }
    }

    // Même email ou même téléphone sur un autre rôle : autorisé, mais le mot
    // de passe doit être différent pour distinguer les deux comptes.
    const sharedCandidates = await prisma.user.findMany({
      where: {
        role: { not: v.role },
        OR: [
          { email },
          ...(phone ? collectPhoneVariants(phone).map((p) => ({ phone: p })) : []),
        ],
      },
    });
    for (const other of sharedCandidates) {
      if (await bcrypt.compare(v.password, other.password)) {
        return reply.code(422).send({
          message:
            'Cet email ou ce numéro est déjà utilisé avec ce mot de passe. Choisissez un mot de passe différent pour ce compte.',
        });
      }
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
    const coords = await geocodeAddress(v.address);

    const accountData = {
      name: v.name,
      email,
      password: hashed,
      phone,
      address: v.address || null,
      gender: v.gender || undefined,
      dateOfBirth: dob && !Number.isNaN(dob.getTime()) ? dob : null,
      role: v.role,
      verified,
      photo: photoPath,
      idCardRecto: idRecto,
      idCardVerso: idVerso,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };

    let user;
    try {
      user = guestAccount
        ? await prisma.user.update({
            where: { id: guestAccount.id },
            data: accountData,
            include: { profile: true },
          })
        : await prisma.user.create({
            data: {
              ...accountData,
              profile: {
                create: {
                  status: v.role === 'maman' ? 'active' : 'pending',
                },
              },
            },
            include: { profile: true },
          });
    } catch (err) {
      // Deux inscriptions simultanées sur le même (email, rôle) : la
      // contrainte unique de la base rejette la seconde → 422 propre.
      if (err?.code === 'P2002') {
        return reply.code(422).send({ message: 'Cet email est déjà utilisé pour ce type de compte.' });
      }
      throw err;
    }

    await notify(user.id, 'account', 'Bienvenue sur Nafissa !', 'Votre compte a été créé avec succès.', '/dashboard');

    // Les prestataires doivent être validés par un administrateur avant de
    // pouvoir se connecter : pas de token tant que le compte n'est pas vérifié.
    if (!user.verified) {
      return reply.code(201).send({
        message:
          'Inscription réussie. Votre compte prestataire est en attente de validation par un administrateur.',
        user: stripUser(user),
        pending_validation: true,
      });
    }

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

  fastify.post('/auth/login', {
    config: { rateLimit: { max: 15, timeWindow: '1 minute' } },
  }, async (request, reply) => {
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
    const candidates = await findUsersByLoginIdentifier(identifier);
    let user = null;
    for (const candidate of candidates) {
      if (await bcrypt.compare(password, candidate.password)) {
        user = candidate;
        break;
      }
    }
    if (!user) {
      return reply.code(401).send({ message: 'Identifiants incorrects.' });
    }
    const u = await userWithProfile(user.id);
    if (u.role !== 'admin' && u.profile?.status === 'suspended') {
      return reply.code(403).send({
        message: "Votre compte est suspendu ou a été refusé. Contactez l'équipe NAFISSA.",
      });
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
    if (d.phone !== undefined) {
      const phone = d.phone ? normalizePhone(d.phone) || d.phone.trim() : null;
      // Le numéro ne doit pas appartenir à un autre compte du même rôle,
      // sinon la connexion par téléphone devient ambiguë.
      if (phone) {
        const phoneTaken = await prisma.user.findFirst({
          where: {
            role: request.user.role,
            id: { not: request.user.id },
            OR: collectPhoneVariants(phone).map((p) => ({ phone: p })),
          },
        });
        if (phoneTaken) {
          return reply.code(422).send({ message: 'Ce numéro est déjà utilisé par un autre compte.' });
        }
      }
      userData.phone = phone;
    }
    if (d.address !== undefined) {
      userData.address = d.address;
      const coords = await geocodeAddress(d.address);
      userData.lat = coords?.lat ?? null;
      userData.lng = coords?.lng ?? null;
    }

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

  fastify.put('/auth/password', { preHandler: authMiddleware }, async (request, reply) => {
    const schema = z.object({
      current_password: z.string().min(1),
      password: z.string().min(8),
      password_confirmation: z.string(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ message: 'Données invalides.' });
    }
    const { current_password, password, password_confirmation } = parsed.data;

    if (password !== password_confirmation) {
      return reply.code(422).send({ message: 'La confirmation du mot de passe ne correspond pas.' });
    }

    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user || !(await bcrypt.compare(current_password, user.password))) {
      return reply.code(422).send({ message: 'Le mot de passe actuel est incorrect.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    await notify(
      user.id,
      'account',
      'Mot de passe modifié',
      'Votre mot de passe a été changé avec succès.',
      '/profile',
    );

    return reply.send({ message: 'Mot de passe mis à jour avec succès.' });
  });
}
