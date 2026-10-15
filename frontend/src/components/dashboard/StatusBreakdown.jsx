import { statusBreakdown } from '../../lib/bookingStatus';

/**
 * Barre de répartition des statuts + légende.
 * `scopeLabel` doit décrire honnêtement l'échantillon affiché.
 */
export default function StatusBreakdown({ bookings = [], scopeLabel }) {
  const rows = statusBreakdown(bookings);

  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-gray-900">Répartition des statuts</h2>
        {scopeLabel && <p className="text-xs font-medium text-muted">{scopeLabel}</p>}
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {rows.map(({ status, share, config }) => (
          <span
            key={status}
            className={config.bar}
            style={{ width: `${share}%` }}
            title={`${config.label} — ${share}%`}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {rows.map(({ status, count, config }) => (
          <li key={status} className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
            <span className="truncate text-xs font-semibold text-gray-600">{config.short}</span>
            <span className="ml-auto text-xs font-bold tabular-nums text-gray-900">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
