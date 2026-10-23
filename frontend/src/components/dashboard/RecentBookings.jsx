import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, ArrowRight } from 'lucide-react';
import { statusConfig } from '../../lib/bookingStatus';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

function EmptyState({ emptyText, emptyCta }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Calendar size={26} />
      </span>
      <div>
        <p className="font-bold text-gray-900">Aucune réservation pour le moment</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">{emptyText}</p>
      </div>
      {emptyCta && (
        <Link
          to={emptyCta.to}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          <Search size={16} /> {emptyCta.label}
        </Link>
      )}
    </div>
  );
}

function BookingRow({ booking, counterpartLabel, counterpart }) {
  const cfg = statusConfig(booking.status);
  const StatusIcon = cfg.icon;

  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-gray-50/80 sm:px-5"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}
      >
        <StatusIcon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">
          {booking.service?.title || booking.category?.name || 'Demande'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} /> {formatDate(booking.booking_date)}
          </span>
          {booking.booking_time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {booking.booking_time}
            </span>
          )}
          {booking.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{booking.location}</span>
            </span>
          )}
        </div>
        {counterpart && (
          <p className="mt-1 truncate text-xs text-gray-400">
            {counterpartLabel} · {counterpart}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="font-display text-sm font-bold tabular-nums text-gray-900">
          {formatPrice(booking.total_price)}
        </p>
        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>
          {cfg.short}
        </span>
      </div>

      <ArrowRight
        size={18}
        className="hidden shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
      />
    </Link>
  );
}

/**
 * Liste compacte des dernières réservations, adaptée au rôle.
 */
export default function RecentBookings({
  bookings = [],
  emptyText,
  emptyCta,
  counterpartLabel = 'Client',
  counterpartKey = 'client',
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <div>
          <h2 className="font-display text-base font-bold text-gray-900">Dernières réservations</h2>
          <p className="mt-0.5 text-xs text-muted">Les 10 demandes les plus récentes</p>
        </div>
        {bookings.length > 0 && (
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-primary transition hover:border-primary/40 hover:bg-primary/5"
          >
            Voir tout <ArrowRight size={13} />
          </Link>
        )}
      </header>

      {bookings.length === 0 ? (
        <EmptyState emptyText={emptyText} emptyCta={emptyCta} />
      ) : (
        <div className="divide-y divide-gray-100">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              counterpartLabel={counterpartLabel}
              counterpart={booking[counterpartKey]?.name}
            />
          ))}
        </div>
      )}
    </section>
  );
}
