import { Link } from 'react-router-dom';

const TONES = {
  primary: {
    wrap: 'bg-primary/12 text-primary',
    ring: 'hover:border-primary/30',
    glow: 'bg-primary/[0.07]',
  },
  secondary: {
    wrap: 'bg-secondary/15 text-secondary-dark',
    ring: 'hover:border-secondary/35',
    glow: 'bg-secondary/[0.09]',
  },
  amber: {
    wrap: 'bg-amber-100 text-amber-700',
    ring: 'hover:border-amber-300',
    glow: 'bg-amber-100/60',
  },
  emerald: {
    wrap: 'bg-emerald-100 text-emerald-700',
    ring: 'hover:border-emerald-300',
    glow: 'bg-emerald-100/60',
  },
  slate: {
    wrap: 'bg-gray-100 text-gray-600',
    ring: 'hover:border-gray-300',
    glow: 'bg-gray-100/70',
  },
};

/**
 * Carte d'indicateur homogène pour tous les tableaux de bord.
 * Devient cliquable si `to` est fourni.
 */
export default function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tone = 'primary',
  to,
  suffix,
  className = '',
}) {
  const t = TONES[tone] || TONES.primary;

  const body = (
    <>
      <span
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${t.glow} blur-2xl`}
      />
      <div className="relative flex items-start gap-3.5">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.wrap}`}
        >
          <Icon size={21} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-extrabold leading-none tabular-nums text-gray-900 sm:text-[1.75rem]">
            {value}
            {suffix && (
              <span className="ml-1 align-middle text-xs font-bold text-gray-400">{suffix}</span>
            )}
          </p>
          <p className="mt-1.5 text-sm font-bold text-gray-700">{label}</p>
          {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
        </div>
      </div>
    </>
  );

  const base = `group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-surface p-4 shadow-sm transition-all sm:p-5 ${t.ring} ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${base} hover:-translate-y-0.5 hover:shadow-md`}>
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
}
