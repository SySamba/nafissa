import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/services';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { statusConfig } from '../lib/bookingStatus';

const UPCOMING_STATUSES = ['en_attente_prestataire', 'acceptee', 'payee', 'en_cours'];
const PAST_STATUSES = ['terminee', 'refusee', 'annulee'];

const byDateAsc = (a, b) =>
  `${a.booking_date ?? ''}T${a.booking_time ?? ''}`.localeCompare(
    `${b.booking_date ?? ''}T${b.booking_time ?? ''}`,
  );
const byDateDesc = (a, b) => byDateAsc(b, a);

function MissionCard({ booking }) {
  const cfg = statusConfig(booking.status);
  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="block rounded-xl border border-gray-100 bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
          <h3 className="truncate font-semibold text-gray-900">
            {booking.service?.title ?? booking.category?.name ?? 'Demande'}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {booking.booking_time}
              {booking.duration ? ` · ${booking.duration}` : ''}
            </span>
            {booking.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {booking.location}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">Cliente : {booking.client?.name ?? '—'}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-gray-900">
            {booking.total_price != null ? `${Number(booking.total_price).toLocaleString()} FCFA` : '—'}
          </p>
          <ArrowRight size={16} className="ml-auto mt-1 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}

function DayGroup({ date, items }) {
  const d = date ? new Date(date) : null;
  const label = !d || Number.isNaN(d.getTime())
    ? 'Date à confirmer'
    : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold capitalize text-gray-700">
        <Calendar size={15} className="text-primary" /> {label}
      </h3>
      <div className="space-y-2.5">
        {items.map((b) => <MissionCard key={b.id} booking={b} />)}
      </div>
    </section>
  );
}

export default function Planning() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(() => {
    bookingAPI.list({ per_page: 100 })
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const upcoming = bookings
    .filter((b) => UPCOMING_STATUSES.includes(b.status))
    .sort(byDateAsc);
  const past = bookings
    .filter((b) => PAST_STATUSES.includes(b.status))
    .sort(byDateDesc)
    .slice(0, 20);

  const groupByDay = (items) => {
    const map = new Map();
    for (const b of items) {
      const key = b.booking_date ? String(b.booking_date).slice(0, 10) : 'sans-date';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    }
    return [...map.entries()];
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon planning</h1>
        <p className="mt-1 text-sm text-muted">Dates et horaires de vos interventions.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Prochaines interventions
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-surface py-14 text-center">
                <Calendar size={44} className="mx-auto mb-3 text-muted/30" />
                <p className="font-semibold text-gray-900">Aucune intervention planifiée</p>
                <p className="mt-1 text-sm text-muted">
                  Les missions attribuées par l&apos;équipe apparaîtront ici.
                </p>
              </div>
            ) : (
              groupByDay(upcoming).map(([day, items]) => (
                <DayGroup key={day} date={day === 'sans-date' ? null : day} items={items} />
              ))
            )}
          </div>

          {past.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Interventions passées
              </h2>
              {groupByDay(past).map(([day, items]) => (
                <DayGroup key={day} date={day === 'sans-date' ? null : day} items={items} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
