import { resolveAuth } from '../lib/auth-resolve.js';

export async function authMiddleware(request, reply) {
  const session = await resolveAuth(request.headers.authorization);
  if (!session) {
    return reply.code(401).send({ message: 'Non authentifié.' });
  }
  request.user = session.user;
  request.accessToken = session.token;
}
