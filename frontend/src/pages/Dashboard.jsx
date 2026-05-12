import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, serviceAPI, paymentAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import { Calendar, CreditCard, Search, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  en_attente_admin: { label: 'En attente admin', color: 'bg-amber-100 text-amber-700', icon: Clock },
  en_attente_prestataire: { label: 'En attente prestataire', color: 'bg-orange-100 text-orange-700', icon: Clock },
  acceptee: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
  payee: { label: 'Payée', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
  en_cours: { label: 'En cours', color: 'bg-primary/10 text-primary', icon: Clock },
  terminee: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Dashboard() {
  const { user, isMaman, isPrestataire } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({ bookings: 0, services: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        bookingAPI.list({ per_page: 5 }),
        paymentAPI.history({ per_page: 1 }),
      ]);

      setRecentBookings(bookingsRes.data.data || []);

      let serviceCount = 0;
      if (isPrestataire) {
        const svcRes = await serviceAPI.mine();
        serviceCount = svcRes.data.services?.length || 0;
      }

      setStats({
        bookings: bookingsRes.data.total || 0,
        services: serviceCount,
        payments: paymentsRes.data.total || 0,
      });
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [isPrestataire]);

  useEffect(() => { fetchData(); }, [fetchData]);
  usePolling(fetchData, 15000, [isPrestataire]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Bonjour, {user?.name} 👋</h1>
        <p className="mt-1 text-white/80">
          {isMaman && 'Trouvez les meilleurs services pour votre famille.'}
          {isPrestataire && 'Gérez vos services et missions en cours.'}
          {user?.role === 'admin' && 'Vue d\'ensemble de la plateforme.'}
        </p>
        {!user?.verified && isPrestataire && (
          <div className="mt-3 bg-white/20 rounded-xl p-3 text-sm">
            ⏳ Votre compte est en attente de validation par l&apos;administrateur.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.bookings}</p>
              <p className="text-sm text-muted">Réservations</p>
            </div>
          </div>
        </div>

        {isPrestataire && (
          <div className="bg-surface rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                <Search size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.services}</p>
                <p className="text-sm text-muted">Mes services</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.payments}</p>
              <p className="text-sm text-muted">Paiements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isMaman && (
          <Link to="/services" className="bg-surface rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Trouver un service</h3>
                <p className="text-sm text-muted mt-1">Parcourir les services disponibles</p>
              </div>
              <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
        {isPrestataire && (
          <Link to="/services" className="bg-surface rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Gérer mes services</h3>
                <p className="text-sm text-muted mt-1">Créer ou modifier vos offres</p>
              </div>
              <ArrowRight size={20} className="text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
        <Link to="/bookings" className="bg-surface rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Mes réservations</h3>
              <p className="text-sm text-muted mt-1">Suivre vos réservations en cours</p>
            </div>
            <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div className="bg-surface rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Réservations récentes</h2>
            <Link to="/bookings" className="text-sm text-primary font-medium hover:text-primary-dark">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.en_attente_admin;
              return (
                <Link key={booking.id} to={`/bookings/${booking.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{booking.service?.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(booking.booking_date).toLocaleDateString('fr-FR')} à {booking.booking_time}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{Number(booking.total_price).toLocaleString()} FCFA</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
