import { Link } from 'react-router-dom';
import { BadgeCheck, ShieldCheck, Wallet, ArrowLeft, Lock } from 'lucide-react';
import BrandMark from './BrandMark';
import heroImage from '../assets/hero.png';

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Prestataires vérifiés',
    text: 'Pièce d’identité contrôlée et profil validé par notre équipe.',
  },
  {
    icon: ShieldCheck,
    title: 'Attribution encadrée',
    text: 'Chaque mission est attribuée depuis le tableau administrateur.',
  },
  {
    icon: Wallet,
    title: 'Paiement protégé',
    text: 'Les fonds ne sont libérés qu’après votre confirmation.',
  },
];

export default function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[46%_54%] xl:grid-cols-[42%_58%]">
      {/* ── Panneau de marque (gauche) ─────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-primary-dark text-white lg:flex lg:flex-col lg:p-12 xl:p-16">
        {/* Image de fond + voiles de couleur */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/85 to-primary-dark/98" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_0%,rgba(201,161,90,0.28),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-secondary/12 blur-3xl" />

        {/* Filet lumineux sur le bord droit */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-secondary/50 to-transparent" />

        {/* Haut : logo */}
        <div className="relative z-10">
          <BrandMark
            to="/"
            light
            compact
            className="rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md transition-colors hover:bg-white/15"
          />
        </div>

        {/* Milieu : accroche + arguments */}
        <div className="relative z-10 mt-14 max-w-lg xl:mt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary-light backdrop-blur-sm">
            NAFISSA · Dakar
          </span>

          <h2 className="mt-7 font-display text-[2.1rem] font-bold leading-[1.12] tracking-tight xl:text-[2.65rem]">
            Services à domicile,
            <span className="block bg-gradient-to-r from-secondary-light to-white bg-clip-text text-transparent">
              la confiance au centre.
            </span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70 xl:text-base">
            Ménage, garde d&apos;enfants, cuisine, lavage… des intervenants sélectionnés, près de chez
            vous, partout au Sénégal.
          </p>

          <ul className="mt-10 space-y-3">
            {FEATURES.map(({ icon: Icon, title: featureTitle, text }) => (
              <li
                key={featureTitle}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-colors hover:border-secondary/30 hover:bg-white/[0.1]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 ring-1 ring-secondary/30 transition-transform group-hover:scale-105">
                  <Icon size={18} className="text-secondary-light" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight text-white">{featureTitle}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bas : note de sécurité */}
        <div className="relative z-10 mt-auto flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-white/55">
          <Lock size={14} className="shrink-0 text-secondary-light" />
          <span>Connexion chiffrée · Vos données ne sont jamais revendues</span>
        </div>
      </aside>

      {/* ── Zone formulaire (droite) ──────────────────────── */}
      <div className="relative flex min-h-screen flex-1 flex-col">
        {/* Fond doux */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-bg" />
        <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />

        {/* Barre mobile */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-gray-200/70 bg-surface/85 px-4 backdrop-blur-xl lg:hidden">
          <BrandMark to="/" compact />
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </header>

        {/* Barre desktop */}
        <div className="hidden px-12 pt-8 lg:flex lg:items-center lg:justify-end">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-surface/70 px-4 py-2 text-sm font-semibold text-gray-500 backdrop-blur-sm transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-[27rem]'}`}>
            {/* Titre */}
            <div className="mb-7 text-center lg:text-left">
              <h1 className="font-display text-[1.65rem] font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted lg:mx-0 sm:text-[15px]">
                  {subtitle}
                </p>
              )}
              <span className="mt-5 inline-block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>

            {/* Carte formulaire */}
            <div className="rounded-[1.75rem] border border-gray-200/80 bg-surface/95 p-6 shadow-[0_20px_60px_-25px_rgba(51,61,36,0.28)] backdrop-blur-sm sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
