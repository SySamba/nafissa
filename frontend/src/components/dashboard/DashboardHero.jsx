const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

function LiveBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
      </span>
      Mise à jour automatique
    </span>
  );
}

/**
 * Bandeau d'en-tête commun aux tableaux de bord.
 */
export default function DashboardHero({ eyebrow, title, description, children, actions }) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary-dark via-primary to-primary-light px-5 py-6 text-white shadow-xl shadow-primary/20 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary-light ring-1 ring-white/15">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display mt-3.5 text-2xl font-extrabold tracking-tight sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-1 text-xs font-medium capitalize text-white/55">{todayLabel()}</p>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-[15px]">
              {description}
            </p>
          )}
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <LiveBadge />
      </div>

      {children && <div className="relative mt-6">{children}</div>}
    </section>
  );
}
