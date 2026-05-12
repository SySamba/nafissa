import { Link } from 'react-router-dom';
import { Heart, Shield, Zap } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-[#0f3d7a] via-primary to-primary-dark text-white flex-col justify-between p-12 xl:p-14">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
            <img src="/logo.webp" alt="Nafissa" className="h-9 w-auto" />
            <span className="font-display font-bold tracking-tight">Nafissa</span>
          </Link>
          <div className="mt-16 space-y-6 max-w-md">
            <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Services à domicile, avec la confiance au centre.
            </h2>
            <p className="text-white/75 text-lg leading-relaxed">
              Rejoignez des centaines de familles et prestataires vérifiés. Paiement sécurisé et suivi transparent.
            </p>
          </div>
        </div>
        <ul className="relative space-y-4 text-sm text-white/85">
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Heart size={18} className="text-rose-300" />
            </span>
            Prestataires validés par l&apos;équipe
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Shield size={18} className="text-emerald-300" />
            </span>
            Paiement protégé jusqu&apos;à votre satisfaction
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Zap size={18} className="text-amber-300" />
            </span>
            Notifications et réservations en temps réel
          </li>
        </ul>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen bg-bg">
        <div className="lg:hidden flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100/80 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="Nafissa" className="h-9" />
            <span className="font-display font-bold text-gray-900 tracking-tight">Nafissa</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-12">
          <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
            <div className="text-center lg:text-left mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-muted mt-2 text-sm sm:text-base leading-relaxed">{subtitle}</p>}
            </div>
            <div className="bg-surface rounded-2xl shadow-[0_20px_60px_-24px_rgba(15,61,122,0.18)] border border-gray-100/90 p-8 sm:p-9">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
