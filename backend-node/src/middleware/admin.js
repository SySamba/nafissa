export async function adminMiddleware(request, reply) {
  if (!request.user || request.user.role !== 'admin') {
    return reply.code(403).send({ message: 'Accès réservé aux administrateurs.' });
  }
}
