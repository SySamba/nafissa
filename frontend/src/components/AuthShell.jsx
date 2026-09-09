import { Link } from 'react-router-dom';
import { BadgeCheck, ShieldCheck, Wallet, Star, ArrowLeft, Sparkles } from 'lucide-react';
import BrandMark from './BrandMark';
import heroImage from '../assets/hero.png';

const FEATURES = [
  { icon: BadgeCheck, text: 'Prestataires vérifiés par notre équipe' },
  { icon: ShieldCheck, text: 'Attribution équitable via le tableau admin' },
  { icon: Wallet, text: 'Paiement sécurisé, libéré après le service' },
];

export default function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[45%_55%] xl:grid-cols-[40%_60%]">
      {/* ── Panneau de marque (gauche) ───────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-primary-dark text-white lg:flex lg:flex-col lg:justify-between xl:p-16 lg:p-12">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light via-primary to-primary-dark" />
        <img
          src={heroImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-dark/85 via-primary/70 to-primary-dark/95" />
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-32 -left-28 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-[30rem] w-[30rem] rounded-full bg-white/8 blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <BrandMark
            to="/"
            light
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md transition-all hover:bg-white/15 hover:scale-105"
          />
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary-light ring-1 ring-secondary/30 mb-6">
            <Sparkles size={14} /> NAFISSA · Dakar
          </div>
          <h2 className="font-display text-3xl font-bold leading-[1.15] tracking-tight xl:text-[2.5rem]">
            Services à domicile, avec la confiance au centre.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/75 xl:text-lg">
            Ménage, garde d&apos;enfants, cuisine, lavage… des intervenants de confiance, près de chez vous,
            au Sénégal.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-[15px] text-white/90">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20 backdrop-blur-sm transition-transform hover:scale-110">
                  <Icon size={20} className="text-secondary-light" />
                </span>
                <span className="leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Testimonial card */}
        <div className="relative z-10 rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-lg">
          <div className="mb-2.5 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className="text-amber-300 fill-amber-300" />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-white/85">
            « J&apos;ai trouvé une nounou de confiance en moins de 24h. Service impeccable. »
          </p>
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary-light text-sm font-bold shadow-lg">
              F
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Fatima Ba</p>
              <p className="text-xs text-white/55">Cliente · Mermoz, Dakar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Zone formulaire (droite) ─────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col bg-bg">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-gray-100/80 bg-surface/95 px-4 backdrop-blur-xl lg:hidden">
          <BrandMark to="/" compact />
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end px-12 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-primary"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8 sm:py-12 lg:px-12">
          <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
            {/* Title block */}
            <div className="mb-6 sm:mb-8">
              <h1 className="font-display text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">{subtitle}</p>
              )}
            </div>

            {/* Form card */}
            <div className="rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-[0_8px_50px_-12px_rgba(68,81,47,0.15)] sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
