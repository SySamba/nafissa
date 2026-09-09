import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, serviceAPI, paymentAPI, marketAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import {
  Calendar,
  CreditCard,
  Search,
  ArrowRight,
  Users,
  LayoutGrid,
} from 'lucide-react';

const STATUS_CONFIG = {
  en_attente_admin: { label: 'En attente admin', color: 'bg-amber-100 text-amber-800' },
  en_attente_prestataire: { label: 'En attente prestataire', color: 'bg-orange-100 text-orange-800' },
  acceptee: { label: 'Acceptée', color: 'bg-blue-100 text-blue-800' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
  payee: { label: 'Payée', color: 'bg-purple-100 text-purple-800' },
  en_cours: { label: 'En cours', color: 'bg-emerald-100 text-emerald-800' },
  terminee: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

const POLL_MS = 12000;

function SyncBadge({ onDark }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        onDark
          ? 'border-white/35 bg-white/12 text-white backdrop-blur-sm'
          : 'border-primary/20 bg-primary/5 text-primary-dark shadow-sm shadow-primary/5'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-65" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
      </span>
      Données actualisées sans recharger la page
    </span>
  );
}

const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function Dashboard() {
  const { user, isMaman, isPrestataire, isAdmin } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({ bookings: 0, services: 0, payments: 0 });
  const [market, setMarket] = useState({ verified_providers_count: 0, active_offers_count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, paymentsRes, marketOrNull, svcOrNull] = await Promise.all([
        bookingAPI.list({ per_page: 5 }),
        paymentAPI.history({ per_page: 1 }),
        isMaman ? marketAPI.summary().catch(() => null) : Promise.resolve(null),
        isPrestataire ? serviceAPI.mine().catch(() => null) : Promise.resolve(null),
      ]);

      setRecentBookings(bookingsRes.data.data || []);

      let serviceCount = 0;
      if (svcOrNull?.data?.services?.length != null) {
        serviceCount = svcOrNull.data.services.length;
      }

      setStats({
        bookings: bookingsRes.data.total || 0,
        services: serviceCount,
        payments: paymentsRes.data.total || 0,
      });

      if (isMaman && marketOrNull?.data) {
        setMarket({
          verified_providers_count: Number(marketOrNull.data.verified_providers_count) || 0,
          active_offers_count: Number(marketOrNull.data.active_offers_count) || 0,
        });
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [isMaman, isPrestataire]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  usePolling(fetchData, POLL_MS, [isMaman, isPrestataire]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light px-5 py-5 text-white shadow-xl shadow-primary/20 sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -left-20 -top-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-secondary-light ring-1 ring-white/15">
              🇸🇳 NAFISSA · Dakar
            </div>
            <h1 className="font-display mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bonjour, {user?.name} 👋
            </h1>
            <p className="mt-1 text-xs font-medium capitalize text-white/60">{todayLabel()}</p>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[15px]">
              {isMaman &&
                'Vous voyez votre activité à jour : le vivier et vos demandes suivent automatiquement, sans rafraîchir.'}
              {isPrestataire && 'Gérez vos offres et missions : les chiffres se mettent à jour tout seuls en arrière-plan.'}
              {!isMaman && !isPrestataire && user?.role === 'admin' && "Vue générale pour piloter les demandes et l'équipe."}
              {!isMaman && !isPrestataire && user?.role !== 'admin' && 'Bienvenue sur votre espace sécurisé.'}
            </p>
          </div>
          <SyncBadge onDark />
        </div>

        {!user?.verified && isPrestataire && (
          <div className="relative mt-5 rounded-xl border border-white/20 bg-black/15 px-4 py-3 text-sm text-white backdrop-blur-sm">
            ⏳ Validation en cours — l&apos;équipe vérifie votre dossier avant toute mise en ligne.
          </div>
        )}
      </section>

      {isMaman && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-secondary/10 p-5 shadow-[0_28px_60px_-32px_rgba(68,81,47,0.55)] sm:p-6 lg:col-span-3">
            <div className="absolute right-6 top-6 opacity-[0.07]">
              <Users size={112} strokeWidth={1} className="text-primary" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                    Prestataires disponibles · vivier contrôlé
                  </p>
                  <p className="font-display mt-2 text-4xl font-black tabular-nums text-gray-900 sm:text-5xl">
                    {market.verified_providers_count}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-700">profils vérifiés prêts à intervenir.</p>
                </div>
                <span className="rounded-2xl bg-primary/90 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                  {market.active_offers_count} offre{market.active_offers_count === 1 ? '' : 's'} active
                  {market.active_offers_count === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-6 space-y-2 rounded-2xl border border-emerald-100/90 bg-white/80 p-4 text-sm leading-relaxed text-gray-700 backdrop-blur-sm">
                <p className="font-semibold text-gray-900">
                  Notre équipe s&apos;occupe de tout : vous décrivez votre besoin, nous attribuons une personne sérieuse parmi ces profils du vivier national.
                </p>
                <p className="text-muted">
                  Pas besoin de parcourir des dizaines de fiches avant de comprendre : la plateforme compte celles-ci pour vous après vérifications.
                </p>
              </div>
              <Link
                to="/services"
                className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-primary-dark sm:w-auto sm:px-8"
              >
                <LayoutGrid size={18} />
                Décrire ou choisir un service
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-gray-200/70 bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stats.bookings}</p>
                  <p className="text-sm font-semibold text-gray-700">Vos réservations</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">Demandes envoyées avec suivi jusqu&apos;à la fin.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <CreditCard size={22} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stats.payments}</p>
                  <p className="text-sm font-semibold text-gray-700">Paiements suivis</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Historique synchronisé (Wave, carte, autres moyens enregistrés).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMaman && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/70 bg-surface p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stats.bookings}</p>
                <p className="text-sm font-semibold text-gray-700">Réservations</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">Synthèse de votre dossier mise à jour en continu.</p>
              </div>
            </div>
          </div>

          {isPrestataire && (
            <div className="rounded-2xl border border-gray-200/70 bg-surface p-4 shadow-sm transition hover:border-secondary/30 hover:shadow-md sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <Search size={22} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stats.services}</p>
                  <p className="text-sm font-semibold text-gray-700">Mes services publiés</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">Offres actives après validation équipe si besoin.</p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl border border-gray-200/70 bg-surface p-4 shadow-sm transition hover:border-accent/30 hover:shadow-md sm:p-5 ${
              isPrestataire ? '' : 'sm:col-span-2 lg:col-span-1'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <CreditCard size={22} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">{stats.payments}</p>
                <p className="text-sm font-semibold text-gray-700">Paiements suivis</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">Voir le détail depuis l&apos;onglet paiements du menu.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {isPrestataire && (
          <Link
            to="/services"
            className="group rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm transition hover:border-secondary/35 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900">Gérer mes services</h3>
                <p className="mt-1 text-sm text-muted">Création, prix, disponibilités — tableau clair façon petite entreprise 🇸🇳</p>
              </div>
              <ArrowRight size={22} className="shrink-0 text-secondary transition group-hover:translate-x-1" />
            </div>
          </Link>
        )}
        {!isPrestataire && !isMaman && (
          <Link
            to="/services"
            className="group rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm transition hover:border-primary/35 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {isAdmin ? 'Parcourir le catalogue interne' : 'Parcourir les services'}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Offres vérifiées d&apos;étudiants et d&apos;artisans mobilisés sur Dakar et partout où NAFISSA est présente.
                </p>
              </div>
              <ArrowRight size={22} className="shrink-0 text-primary transition group-hover:translate-x-1" />
            </div>
          </Link>
        )}
        <Link
          to="/bookings"
          className={`group rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm transition hover:border-primary/30 hover:shadow-lg sm:p-6 ${
            !isPrestataire && isMaman ? 'sm:col-span-2' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900">Mes réservations</h3>
              <p className="mt-1 text-sm text-muted">
                Étapes jusqu&apos;à la fin confirmée avec le prestataire — statuts reflétés automatiquement.
              </p>
            </div>
            <ArrowRight size={22} className="shrink-0 text-primary transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="font-display text-base font-bold text-gray-900 sm:text-lg">À jour · dernières réservations</h2>
          {recentBookings.length > 0 && (
            <Link to="/bookings" className="text-sm font-semibold text-primary hover:text-primary-dark">
              Voir tout
            </Link>
          )}
        </div>
        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar size={26} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Aucune réservation pour le moment</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                {isMaman
                  ? 'Décrivez votre besoin : notre équipe vous attribue un prestataire vérifié.'
                  : isPrestataire
                    ? 'Vos missions attribuées apparaîtront ici dès qu’une cliente fera appel à vous.'
                    : 'Les dernières réservations de la plateforme s’afficheront ici.'}
              </p>
            </div>
            {(isMaman || (!isPrestataire && !isAdmin)) && (
              <Link
                to="/services"
                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
              >
                <Search size={16} /> Parcourir les services
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.en_attente_admin;
              return (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-gray-50 sm:px-5 sm:py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{booking.service?.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(booking.booking_date).toLocaleDateString('fr-FR')} à {booking.booking_time}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold ${cfg.color} rounded-full px-2.5 py-1`}>{cfg.label}</span>
                  <p className="font-display shrink-0 text-sm font-bold text-gray-900 sm:text-base">
                    {Number(booking.total_price).toLocaleString()} FCFA
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
