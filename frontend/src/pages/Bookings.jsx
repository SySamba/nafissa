import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight, CreditCard } from 'lucide-react';

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

export default function Bookings() {
  const { isMaman } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = useCallback(() => {
    setLoading(true);
    bookingAPI.list({ page })
      .then(({ data }) => {
        setBookings(data.data || []);
        setLastPage(data.last_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  usePolling(fetchBookings, 15000, [page]);

  const filteredBookings = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <p className="text-muted text-sm mt-1">
          {isMaman ? 'Suivez vos réservations de services' : 'Gérez les demandes de vos clients'}
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[{ value: '', label: 'Toutes' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))].map(({ value, label }) => (
          <button key={value} onClick={() => setStatusFilter(value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === value ? 'bg-primary text-white' : 'bg-surface border border-gray-200 text-muted hover:border-primary hover:text-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
          <Calendar size={48} className="mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucune réservation</h3>
          <p className="text-muted text-sm mt-1">
            {isMaman ? 'Parcourez les services pour faire votre première réservation.' : 'Aucune demande reçue pour le moment.'}
          </p>
          {isMaman && (
            <Link to="/services" className="inline-flex items-center gap-2 mt-4 text-primary font-medium text-sm hover:text-primary-dark">
              Parcourir les services <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.en_attente_admin;
            const StatusIcon = cfg.icon;
            return (
              <Link key={booking.id} to={`/bookings/${booking.id}`}
                className="block bg-surface rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon size={16} className={cfg.color.split(' ')[1]} />
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{booking.service?.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(booking.booking_date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {booking.booking_time}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {isMaman ? (booking.provider ? `Prestataire: ${booking.provider.name}` : 'Prestataire: En attente d\'attribution') : `Client: ${booking.client?.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{Number(booking.total_price).toLocaleString()} FCFA</p>
                    {booking.payment && (
                      <span className="text-xs text-secondary font-medium">Payé</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Précédent
          </button>
          <span className="text-sm text-muted">Page {page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
