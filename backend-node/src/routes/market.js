import { prisma } from '../lib/prisma.js';

/**
 * Synthèse publique du vivier marchand (pour accueils / dashboard client).
 */
export default async function marketRoutes(fastify) {
  fastify.get('/market/summary', async () => {
    const [verifiedProvidersWithOffers, publishedOffers] = await prisma.$transaction([
      prisma.user.count({
        where: {
          verified: true,
          role: { in: ['etudiant', 'artisan'] },
          profile: { status: 'active' },
          services: { some: { available: true } },
        },
      }),
      prisma.service.count({
        where: {
          available: true,
          provider: {
            verified: true,
            role: { in: ['etudiant', 'artisan'] },
            profile: { status: 'active' },
          },
        },
      }),
    ]);

    return {
      verified_providers_count: verifiedProvidersWithOffers,
      active_offers_count: publishedOffers,
    };
  });
}
