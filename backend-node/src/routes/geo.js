import { z } from 'zod';
import { geocodeAddress, reverseGeocode, searchAddresses } from '../lib/geocode.js';

/**
 * Aides de localisation du formulaire de demande (publiques, limitées) :
 * - /geo/reverse : position GPS → adresse lisible
 * - /geo/search  : adresse saisie → coordonnées (aperçu sur la carte)
 */
export default async function geoRoutes(fastify) {
  const limited = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

  fastify.get('/geo/reverse', limited, async (request, reply) => {
    const parsed = z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    }).safeParse(request.query || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Position invalide.' });
    const { lat, lng } = parsed.data;
    const hit = await reverseGeocode(lat, lng);
    return { lat, lng, label: hit?.label ?? null, full: hit?.full ?? null };
  });

  fastify.get('/geo/suggest', limited, async (request, reply) => {
    const parsed = z.object({ q: z.string().trim().min(2).max(255) }).safeParse(request.query || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Adresse invalide.' });
    const results = await searchAddresses(parsed.data.q);
    return { results };
  });

  fastify.get('/geo/search', limited, async (request, reply) => {
    const parsed = z.object({ q: z.string().trim().min(2).max(255) }).safeParse(request.query || {});
    if (!parsed.success) return reply.code(422).send({ message: 'Adresse invalide.' });
    const hit = await geocodeAddress(parsed.data.q);
    if (!hit) return reply.code(404).send({ message: 'Adresse introuvable.' });
    return { lat: hit.lat, lng: hit.lng, label: hit.label ?? parsed.data.q };
  });
}
