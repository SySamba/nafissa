import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, serviceAPI, paymentAPI, marketAPI, adminAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import StatCard from '../components/dashboard/StatCard';
import AvailabilityToggle from '../components/AvailabilityToggle';
import StatusBreakdown from '../components/dashboard/StatusBreakdown';
import RecentBookings from '../components/dashboard/RecentBookings';
import { countActive } from '../lib/bookingStatus';
import {
  Calendar,
  CreditCard,
  Search,
  ArrowRight,
  Users,
  LayoutGrid,
  Briefcase,
  Activity,
  ShieldCheck,
  UserCheck,
  Wallet,
  ClipboardList,
  Clock,
} from 'lucide-react';

const POLL_MS = 12000;

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-44 animate-pulse rounded-[1.5rem] bg-gray-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function Dashboard() {
  const { user, isMaman, isPrestataire, isAdmin } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({ bookings: 0, services: 0, payments: 0 });
  const [market, setMarket] = useState({ verified_providers_count: 0, active_offers_count: 0 });
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, paymentsRes, marketOrNull, svcOrNull, adminOrNull] = await Promise.all([
        bookingAPI.list(),
        paymentAPI.history(),
        isMaman ? marketAPI.summary().catch(() => null) : Promise.resolve(null),
        isPrestataire ? serviceAPI.mine().catch(() => null) : Promise.resolve(null),
        isAdmin ? adminAPI.dashboard().catch(() => null) : Promise.resolve(null),
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

      if (isAdmin && adminOrNull?.data?.stats) {
        setAdminStats(adminOrNull.data.stats);
      }
    } catch {
      // Erreurs réseau ignorées : le polling retentera au prochain cycle.
    } finally {
      setLoading(false);
    }
  }, [isMaman, isPrestataire, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  usePolling(fetchData, POLL_MS, [isMaman, isPrestataire, isAdmin]);

  if (loading) return <DashboardSkeleton />;

  const activeCount = countActive(recentBookings);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Disponibilité en premier : le prestataire pilote la réception
          des propositions directement depuis le haut de son tableau de bord. */}
      {isPrestataire && <AvailabilityToggle />}

      {isPrestataire && !user?.verified && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <span className="leading-relaxed">
            <span className="font-bold">Validation en cours</span> — l&apos;équipe vérifie votre
            dossier avant la mise en ligne de vos offres.
          </span>
        </div>
      )}

      {/* ── KPI administrateur ── */}
      {isAdmin && adminStats && (
        <>
          {adminStats.pending_bookings > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-secondary/30 bg-secondary/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-dark">
                  <ClipboardList size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {adminStats.pending_bookings} demande
                    {adminStats.pending_bookings > 1 ? 's' : ''} à attribuer
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                    Choisissez un prestataire : il recevra la mission à accepter ou refuser.
                  </p>
                </div>
              </div>
              <Link
                to="/admin"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-secondary-dark"
              >
                Traiter maintenant <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Users}
              value={fmt(adminStats.total_users)}
              label="Utilisateurs"
              hint="Comptes enregistrés sur la plateforme."
              tone="primary"
            />
            <StatCard
              icon={UserCheck}
              value={fmt(adminStats.pending_accounts)}
              label="Comptes à valider"
              hint="Dossiers en attente de vérification."
              tone={adminStats.pending_accounts > 0 ? 'amber' : 'slate'}
              to="/admin"
            />
            <StatCard
              icon={Activity}
              value={fmt(adminStats.active_bookings)}
              label="Réservations actives"
              hint="Missions en circulation, hors terminées."
              tone="emerald"
            />
            <StatCard
              icon={Calendar}
              value={fmt(adminStats.total_bookings)}
              label="Réservations totales"
              hint="Volume cumulé depuis le lancement."
              tone="slate"
              to="/bookings"
            />
            <StatCard
              icon={Wallet}
              value={fmt(adminStats.total_payments)}
              suffix="FCFA"
              label="Volume encaissé"
              hint="Somme des paiements finalisés."
              tone="secondary"
            />
            <StatCard
              icon={CreditCard}
              value={fmt(adminStats.total_revenue)}
              suffix="FCFA"
              label="Commissions"
              hint="Part NAFISSA sur les paiements finalisés."
              tone="secondary"
            />
          </div>
        </>
      )}

      {/* ── Vivier + KPI cliente ── */}
      {isMaman && (
        <div className="grid gap-5 lg:grid-cols-5">
          <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-surface to-secondary/10 p-5 shadow-[0_24px_55px_-30px_rgba(68,81,47,0.5)] sm:p-6 lg:col-span-3">
            <Users
              size={128}
              strokeWidth={1}
              className="pointer-events-none absolute -right-4 top-4 text-primary opacity-[0.06]"
            />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">
                    Vivier contrôlé
                  </p>
                  <p className="font-display mt-2 text-4xl font-black leading-none tabular-nums text-gray-900 sm:text-5xl">
                    {fmt(market.verified_providers_count)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    profils vérifiés prêts à intervenir
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                  <ShieldCheck size={13} />
                  {fmt(market.active_offers_count)} offre
                  {market.active_offers_count === 1 ? '' : 's'}
                </span>
              </div>

              <p className="mt-5 rounded-xl border border-gray-200/70 bg-surface/80 p-4 text-sm leading-relaxed text-gray-600 backdrop-blur-sm">
                <span className="font-bold text-gray-900">Vous décrivez, nous attribuons.</span>{' '}
                Notre équipe sélectionne une personne sérieuse dans ce vivier — pas besoin de
                parcourir des dizaines de fiches.
              </p>

              <Link
                to="/demande"
                className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark sm:w-auto sm:px-7"
              >
                <LayoutGrid size={17} /> Décrire mon besoin
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            <StatCard
              icon={Calendar}
              value={fmt(stats.bookings)}
              label="Vos réservations"
              hint="Demandes envoyées, suivies jusqu'à la fin."
              tone="primary"
              to="/bookings"
            />
            <StatCard
              icon={Activity}
              value={fmt(activeCount)}
              label="En cours de traitement"
              hint="Sur vos 10 demandes les plus récentes."
              tone="emerald"
            />
            <StatCard
              icon={CreditCard}
              value={fmt(stats.payments)}
              label="Paiements suivis"
              hint="Historique Wave, carte et autres moyens."
              tone="amber"
              to="/payments"
            />
          </div>
        </div>
      )}

      {/* ── KPI prestataire ── */}
      {isPrestataire && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Calendar}
            value={fmt(stats.bookings)}
            label="Missions reçues"
            hint="Total des missions qui vous ont été attribuées."
            tone="primary"
            to="/bookings"
          />
          <StatCard
            icon={Activity}
            value={fmt(activeCount)}
            label="À traiter"
            hint="Sur vos 10 missions les plus récentes."
            tone="emerald"
          />
          <StatCard
            icon={Briefcase}
            value={fmt(stats.services)}
            label="Services publiés"
            hint="Offres visibles par les clients."
            tone="secondary"
            to="/services"
          />
          <StatCard
            icon={CreditCard}
            value={fmt(stats.payments)}
            label="Paiements suivis"
            hint="Versés après confirmation du client."
            tone="amber"
            to="/payments"
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings
            bookings={recentBookings}
            counterpartLabel={isPrestataire ? 'Client' : 'Prestataire'}
            counterpartKey={isPrestataire ? 'client' : 'provider'}
            emptyText={
              isMaman
                ? "Décrivez votre besoin : notre équipe vous attribue un prestataire vérifié."
                : isPrestataire
                  ? "Vos missions attribuées apparaîtront ici dès qu'un client fera appel à vous."
                  : 'Les dernières réservations de la plateforme s’afficheront ici.'
            }
            emptyCta={
              isMaman || (!isPrestataire && !isAdmin)
                ? { to: '/demande', label: 'Faire une demande' }
                : null
            }
          />
        </div>

        <div className="space-y-5">
          <StatusBreakdown
            bookings={recentBookings}
            scopeLabel={`Sur ${recentBookings.length} réservation${recentBookings.length > 1 ? 's' : ''} récente${recentBookings.length > 1 ? 's' : ''}`}
          />

          <nav className="overflow-hidden rounded-2xl border border-gray-200/80 bg-surface shadow-sm">
            <p className="border-b border-gray-100 px-5 py-3.5 font-display text-base font-bold text-gray-900">
              Accès rapides
            </p>
            <ul className="divide-y divide-gray-100">
              {[
                isPrestataire && {
                  to: '/services',
                  icon: Briefcase,
                  title: 'Gérer mes services',
                  desc: 'Création, prix, disponibilités.',
                },
                isMaman && {
                  to: '/demande',
                  icon: Search,
                  title: 'Nouvelle demande',
                  desc: 'Décrire un besoin, notre équipe attribue.',
                },
                isAdmin && {
                  to: '/admin',
                  icon: ClipboardList,
                  title: 'Attribuer les demandes',
                  desc: 'Traiter la file en attente admin.',
                },
                {
                  to: '/bookings',
                  icon: Calendar,
                  title: 'Toutes mes réservations',
                  desc: 'Suivi statut par statut.',
                },
                {
                  to: '/payments',
                  icon: CreditCard,
                  title: 'Paiements',
                  desc: 'Historique et libération des fonds.',
                },
              ]
                .filter(Boolean)
                .map(({ to, icon: Icon, title, desc }) => (
                  <li key={title}>
                    <Link
                      to={to}
                      className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-gray-50/80"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-gray-900">{title}</span>
                        <span className="block truncate text-xs text-muted">{desc}</span>
                      </span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
