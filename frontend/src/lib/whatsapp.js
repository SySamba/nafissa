import { statusConfig } from './bookingStatus';

/**
 * Lien WhatsApp « click to chat » (wa.me) vers un numéro sénégalais.
 * Accepte 9 chiffres locaux, 221…, +221…, 00221… ; renvoie null sans numéro valide.
 */
export function waLink(phone, text) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00221')) digits = `221${digits.slice(5)}`;
  if (digits.length === 9) digits = `221${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** URL publique de suivi d'une demande (sans connexion). */
export function trackingUrl(token) {
  if (!token) return null;
  return `${window.location.origin}/suivi/${token}`;
}

/** Message pré-rempli envoyé par l'admin à la cliente pour le suivi. */
export function trackingMessage(booking) {
  const cfg = statusConfig(booking?.status);
  const service = booking?.service?.title || 'votre service';
  const parts = [
    `Bonjour${booking?.client?.name ? ` ${booking.client.name}` : ''},`,
    '',
    `Suivi de votre demande NAFISSA n°${booking?.id} — « ${service} ».`,
    `Statut actuel : ${cfg?.label || booking?.status}.`,
  ];
  const url = trackingUrl(booking?.tracking_token);
  if (url) parts.push('', `Suivez votre demande en temps réel ici : ${url}`);
  parts.push('', "— L'équipe NAFISSA");
  return parts.join('\n');
}

/** Lien wa.me complet prêt à ouvrir pour envoyer le suivi à la cliente. */
export function whatsappTrackingLink(booking) {
  const link = waLink(booking?.client?.phone, trackingMessage(booking));
  return link;
}
