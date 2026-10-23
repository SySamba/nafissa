import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import compress from '@fastify/compress';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { prismaPayloadToApiJson } from './lib/api-json.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import marketRoutes from './routes/market.js';
import trackingRoutes from './routes/tracking.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

BigInt.prototype.toJSON = function () {
  const n = Number(this);
  return Number.isSafeInteger(n) ? n : this.toString();
};

export async function buildApp() {
  const fastify = Fastify({
    // Logger toujours actif : indispensable pour diagnostiquer l'exécution
    // (les journaux Hostinger capturent stdout). LOG_LEVEL=warn pour réduire.
    logger: { level: process.env.LOG_LEVEL || 'info' },
    trustProxy: true,
    bodyLimit: 12 * 1024 * 1024,
  });

  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(compress);
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL?.split(',').map((s) => s.trim()) || true,
    credentials: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 6 * 1024 * 1024,
      files: 3,
    },
  });

  // Anti-abus : seules les routes qui déclarent config.rateLimit sont
  // limitées (création de demande, auth, suivi public).
  await fastify.register(rateLimit, { global: false });

  // Le dossier d'upload est créé s'il manque (déploiement frais) : les
  // fichiers doivent rester servis sans intervention manuelle.
  const storageRoot =
    process.env.STORAGE_PATH || path.join(__dirname, '..', '..', 'backend', 'storage', 'app', 'public');
  try {
    fs.mkdirSync(storageRoot, { recursive: true });
  } catch (err) {
    fastify.log.warn(`Impossible de créer le dossier storage (${storageRoot}): ${err.message}`);
  }
  if (fs.existsSync(storageRoot)) {
    await fastify.register(fastifyStatic, {
      root: storageRoot,
      prefix: '/storage/',
      decorateReply: false,
    });
  } else {
    fastify.log.warn(`Dossier storage absent (${storageRoot}), /storage/ non servi.`);
  }

  const apiOpts = { prefix: '/api' };
  await fastify.register(authRoutes, apiOpts);
  await fastify.register(marketRoutes, apiOpts);
  await fastify.register(trackingRoutes, apiOpts);
  await fastify.register(serviceRoutes, apiOpts);
  await fastify.register(bookingRoutes, apiOpts);
  await fastify.register(paymentRoutes, apiOpts);
  await fastify.register(notificationRoutes, apiOpts);
  await fastify.register(adminRoutes, apiOpts);

  fastify.get('/up', async () => ({ status: 'ok' }));

  // Production : servir le build Vite du frontend + repli SPA (toute route
  // non-API renvoie index.html pour React Router).
  const frontendDist =
    process.env.FRONTEND_DIST || path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(frontendDist)) {
    await fastify.register(fastifyStatic, {
      root: frontendDist,
      prefix: '/',
      index: ['index.html'],
    });
    fastify.setNotFoundHandler((request, reply) => {
      const isAssetRoute =
        request.method === 'GET' &&
        !request.url.startsWith('/api') &&
        !request.url.startsWith('/storage');
      if (isAssetRoute) return reply.sendFile('index.html');
      return reply.code(404).send({ message: 'Introuvable.' });
    });
  } else {
    fastify.log.warn(`Build frontend absent (${frontendDist}), seule l'API est servie.`);
  }

  fastify.addHook('preSerialization', async (_request, _reply, payload) => {
    if (payload && typeof payload === 'object') {
      return prismaPayloadToApiJson(payload);
    }
    return payload;
  });

  return fastify;
}
