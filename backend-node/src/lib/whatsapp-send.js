/**
 * Envoi automatique de messages WhatsApp via l'API Meta Cloud (WhatsApp Business).
 *
 * Config (.env) :
 *   WHATSAPP_TOKEN           — jeton d'accès Meta (permanent ou test 24 h)
 *   WHATSAPP_PHONE_NUMBER_ID — identifiant du numéro d'envoi (Meta for Developers)
 *   WHATSAPP_API_VERSION     — optionnel, défaut v21.0
 *   APP_PUBLIC_URL           — URL publique du site (liens de suivi envoyés)
 *
 * Non configuré → les envois sont ignorés silencieusement (repli : bouton
 * « Suivi WhatsApp » côté admin, qui ouvre wa.me).
 */

const noop = { warn: () => {}, info: () => {} };

export function whatsappEnabled() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Numéro sénégalais → format international sans « + » (wa.me / API Meta). */
export function normalizeWaNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00221')) digits = `221${digits.slice(5)}`;
  if (digits.length === 9) digits = `221${digits}`;
  return digits.length >= 10 ? digits : null;
}

export function trackingLink(token) {
  const base = (process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return token ? `${base}/suivi/${token}` : base;
}

/** Envoie un texte WhatsApp. Ne lève jamais d'erreur : renvoie { sent, reason }. */
export async function sendWhatsApp(to, text, logger = noop) {
  const number = normalizeWaNumber(to);
  if (!number) return { sent: false, reason: 'numéro invalide' };
  if (!whatsappEnabled()) return { sent: false, reason: 'non configuré' };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v21.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: number,
          type: 'text',
          text: { body: text, preview_url: true },
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text();
      logger.warn({ status: res.status, detail }, 'WhatsApp envoi échoué');
      return { sent: false, reason: `HTTP ${res.status}` };
    }
    logger.info({ to: number }, 'WhatsApp envoyé');
    return { sent: true };
  } catch (err) {
    logger.warn({ err: err.message }, 'WhatsApp envoi échoué');
    return { sent: false, reason: err.message };
  }
}

const STATUS_LABELS = {
  en_attente_admin: 'en cours d\'analyse par notre équipe',
  en_attente_prestataire: 'un prestataire a été sélectionné, en attente de sa confirmation',
  acceptee: 'acceptée par le prestataire',
  en_cours: 'en cours de réalisation',
  terminee: 'terminée. Merci pour votre confiance !',
  annulee: 'annulée. Contactez-nous pour toute question.',
};

/** Message de suivi envoyé à la cliente à chaque changement de statut. */
export function clientStatusText(booking) {
  const label = STATUS_LABELS[booking.status] || booking.status;
  const parts = [
    `Bonjour${booking.client?.name ? ` ${booking.client.name}` : ''},`,
    '',
    `Votre demande NAFISSA n°${booking.id} — « ${booking.service?.title || 'service'} » est ${label}.`,
  ];
  if (booking.trackingToken) {
    parts.push('', `Suivez-la en temps réel : ${trackingLink(booking.trackingToken)}`);
  }
  parts.push('', "— L'équipe NAFISSA");
  return parts.join('\n');
}
