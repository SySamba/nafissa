import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import compress from '@fastify/compress';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { prismaPayloadToApiJson } from './lib/api-json.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

BigInt.prototype.toJSON = function () {
  const n = Number(this);
  return Number.isSafeInteger(n) ? n : this.toString();
};

export async function buildApp() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'production',
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

  const storageRoot =
    process.env.STORAGE_PATH || path.join(__dirname, '..', '..', 'backend', 'storage', 'app', 'public');
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
  await fastify.register(serviceRoutes, apiOpts);
  await fastify.register(bookingRoutes, apiOpts);
  await fastify.register(paymentRoutes, apiOpts);
  await fastify.register(notificationRoutes, apiOpts);
  await fastify.register(adminRoutes, apiOpts);

  fastify.get('/up', async () => ({ status: 'ok' }));

  fastify.addHook('preSerialization', async (_request, _reply, payload) => {
    if (payload && typeof payload === 'object') {
      return prismaPayloadToApiJson(payload);
    }
    return payload;
  });

  return fastify;
}
