-- Chemin SPA optionnel pour ouvrir la page concernée (ex: /bookings/6)
ALTER TABLE "notifications_custom" ADD COLUMN "action_link" VARCHAR(500);
