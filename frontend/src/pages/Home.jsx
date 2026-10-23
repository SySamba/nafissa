import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from '../components/BrandMark';
import InstallPwa from '../components/InstallPwa';
import {
  ArrowRight, Shield,
  Phone, MapPin, Mail, ChevronRight, Menu, X
} from 'lucide-react';
import { homepageCategoryVisual } from '../lib/categoryImages';
// Hero image depuis le dossier public/

// Services prioritaires NAFISSA
const PRIORITY_SERVICES = [
  { slug: 'home', name: 'Ménage', desc: 'Nettoyage professionnel du domicile' },
  { slug: 'laundry', name: 'Lavage & Repassage', desc: 'Linge lavé, séché et repassé' },
  { slug: 'shopping', name: 'Course', desc: 'Vos achats du quotidien livrés' },
  { slug: 'baby', name: 'Garde d\'enfant', desc: 'Nounous de confiance' },
  { slug: 'utensils', name: 'Cuisine', desc: 'Repas faits maison' },
];

// Services secondaires NAFISSA
const SECONDARY_SERVICES = [
  { slug: 'book-open', name: 'Soutien scolaire', desc: 'Cours particuliers à domicile' },
  { slug: 'zap', name: 'Électricien', desc: 'Installation & dépannage' },
  { slug: 'plumber', name: 'Plombier', desc: 'Fuites, sanitaires, robinetterie' },
  { slug: 'carpenter', name: 'Menuisier', desc: 'Bois, meubles & réparations' },
];

const WORKFLOW_STEPS = [
  { num: '1', title: 'Vous décrivez votre besoin', desc: 'Type de service, date, heure, lieu et détails : le formulaire prend tout.' },
  { num: '2', title: 'Notre équipe étudie la demande', desc: 'L\'administration NAFISSA vérifie votre besoin et votre zone d\'intervention.' },
  { num: '3', title: 'Attribution du bon prestataire', desc: 'Nous choisissons pour vous un prestataire vérifié, proche et disponible.' },
  { num: '4', title: 'Confirmation de la mission', desc: 'Le prestataire accepte la mission : vous êtes informée immédiatement.' },
  { num: '5', title: 'Paiement sécurisé', desc: 'Vous payez après acceptation ; le montant n\'est libéré qu\'une fois la mission confirmée.' },
];

function renderServiceCard({ name, desc, slug }) {
  const { image, gradient } = homepageCategoryVisual(slug);
  return (
    <Link
      to="/demande"
      key={name}
      className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-gray-200/90 bg-white shadow-md ring-1 ring-black/[0.04] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      <div className={`relative h-36 w-full shrink-0 overflow-hidden bg-gradient-to-br ${gradient} sm:h-44`}>
        {image && (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5">
          <p className="text-base font-bold text-white drop-shadow">{name}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-gray-500 line-clamp-2">{desc}</p>
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-50">
          <span className="text-xs font-bold text-primary">Faire une demande</span>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-secondary group-hover:translate-x-0.5 transition-all" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <BrandMark to="/" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#how" className="hover:text-primary transition-colors">Comment ça marche</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            <Link to="/demande" className="text-primary font-bold hover:text-primary-dark transition-colors">Faire une demande</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                Mon espace <ChevronRight size={14} className="inline ml-1" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex text-gray-600 hover:text-primary px-4 py-2.5 text-sm font-semibold transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="hidden md:inline-flex bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  S&apos;inscrire
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm font-semibold text-gray-700">
              <a href="#services" onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-gray-50 hover:text-primary transition-colors">Services</a>
              <a href="#how" onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-gray-50 hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#contact" onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-gray-50 hover:text-primary transition-colors">Contact</a>
              <Link to="/demande" onClick={closeMenu} className="rounded-xl px-3 py-3 font-bold text-primary hover:bg-primary/5 transition-colors">Faire une demande</Link>
              {!user && (
                <>
                  <Link to="/login" onClick={closeMenu} className="rounded-xl px-3 py-3 text-primary hover:bg-primary/5 transition-colors">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="mt-1 rounded-xl bg-primary px-3 py-3 text-center font-bold text-white transition-colors hover:bg-primary-dark"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative isolate pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Fond 100 % CSS (aucune image distante → toujours affiché) */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#EFEBE2] via-bg to-white" />
        <div className="absolute -top-32 -left-24 -z-10 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -top-10 right-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            {/* Colonne texte */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/85 border border-secondary/35 text-gray-900 px-5 py-2 rounded-full text-sm font-semibold mb-7 shadow-md backdrop-blur-sm">
                <span>Services à domicile de confiance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
                Votre quotidien,{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">simplifié</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none"><path d="M2 8c30-6 60-6 90-2s70 4 106-2" stroke="url(#g)" strokeWidth="3" strokeLinecap="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="200" y2="0"><stop stopColor="#44512F"/><stop offset="1" stopColor="#C9A15A"/></linearGradient></defs></svg>
                </span>
              </h1>

              <p className="mt-7 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Ménage, garde d&apos;enfants, cuisine, lavage… Décrivez votre besoin : <strong className="text-gray-700">notre équipe vous attribue un prestataire vérifié</strong>, proche et disponible.
              </p>

              {/* CTA Buttons */}
              <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4">
                <Link to="/demande" className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0">
                  Faire une demande <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-secondary/10 hover:bg-secondary/15 text-secondary px-8 py-4 rounded-2xl text-base font-bold transition-all border border-secondary/20 hover:border-secondary/40">
                  Devenir prestataire
                </Link>
              </div>

            </div>

            {/* Colonne visuel (illustration locale → fiable) */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl shadow-primary/20 ring-1 ring-black/5">
                <img
                  src="/Page de garde du site.png"
                  alt="NAFISSA — services à domicile de confiance au Sénégal"
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
              {/* Badge flottant */}
              <div className="absolute -bottom-4 left-4 sm:left-6 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-black/5 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Shield size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-gray-900 leading-tight">Prestataires vérifiés</p>
                  <p className="text-xs text-gray-400">Pièces d&apos;identité contrôlées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm font-medium text-gray-400">
            <span>Prestataires vérifiés</span>
            <span>Paiement sécurisé</span>
            <span>Réponse en 24h</span>
            <span>Avis clients vérifiés</span>
            <span>Service garanti</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES / SERVICES
      ═══════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-secondary font-bold text-sm uppercase tracking-wider mb-3">Nos services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Tout pour votre <span className="text-primary">famille</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
              Des intervenants de confiance, près de chez vous — parce que NAFISSA, c’est votre foyer d’abord.
            </p>
          </div>

          {/* Services prioritaires */}
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              Services prioritaires
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {PRIORITY_SERVICES.map((svc) => renderServiceCard(svc))}
          </div>

          {/* Services secondaires */}
          <div className="mt-16 mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-dark">
              Services secondaires
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SECONDARY_SERVICES.map((svc) => renderServiceCard(svc))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-bold text-sm uppercase tracking-wider mb-3">Comment ça marche</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              De la demande à <span className="text-secondary">l&apos;intervention</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Vous décrivez votre besoin, notre équipe attribue le prestataire adapté — chaque étape est suivie jusqu&apos;à la fin de la mission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            {WORKFLOW_STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="relative group">
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="hidden xl:block absolute top-11 left-[calc(100%+2px)] w-[calc(100%-20px)] h-0.5 z-0">
                    <div className="w-full h-full bg-gradient-to-r from-primary/25 to-secondary/25 rounded-full" />
                  </div>
                )}
                <div className="relative z-[1] bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-extrabold text-white shadow-lg shadow-primary/20">
                      {num}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-snug">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-secondary font-bold text-sm uppercase tracking-wider mb-3">Nos garanties</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Pourquoi choisir <span className="text-primary">Nafissa</span> ?
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">La confiance et la qualité au cœur de chaque service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Prestataires vérifiés',
                desc: 'Chaque prestataire fournit sa pièce d\'identité et est validé par notre équipe avant de pouvoir recevoir des missions.',
              },
              {
                title: 'Paiement sécurisé',
                desc: 'Votre paiement est retenu en sécurité et n\'est libéré au prestataire qu\'après votre confirmation de satisfaction.',
              },
              {
                title: 'Suivi en temps réel',
                desc: 'Suivez l\'avancement de votre demande étape par étape, de l\'attribution du prestataire à la fin de la mission.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#222A18]" />
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-light/10 rounded-full blur-3xl" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
                Rejoignez la communauté
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
                Prêt(e) à simplifier<br className="hidden sm:block" /> votre quotidien ?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Rejoignez Nafissa et accédez à des services de qualité, rendus par des prestataires vérifiés, en toute confiance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 bg-white text-primary px-10 py-4.5 rounded-2xl text-base font-bold hover:bg-gray-50 transition-all shadow-2xl hover:-translate-y-0.5">
                  Créer mon compte gratuitement <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-10 py-4.5 rounded-2xl text-base font-semibold hover:bg-white/10 hover:border-white/50 transition-all">
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer id="contact" className="bg-gray-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div className="md:col-span-5">
            <div className="mb-5">
              <img
                src="/Icone NAFISSA.png"
                alt="NAFISSA"
                className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
              />
            </div>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                La plateforme de confiance pour les services à domicile au Sénégal. Ménage, garde d&apos;enfants, cuisine et bien plus encore.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paiements via</span>
                <span className="text-sm text-gray-400">Wave</span>
                <span className="text-sm text-gray-400">Orange Money</span>
                <span className="text-sm text-gray-400">Free Money</span>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-3">
              <h4 className="font-bold text-sm mb-5 text-white uppercase tracking-wider">Plateforme</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12} /> S&apos;inscrire</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12} /> Se connecter</Link></li>
                <li><a href="#services" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12} /> Nos services</a></li>
                <li><a href="#how" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12} /> Comment ça marche</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="font-bold text-sm mb-5 text-white uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3"><MapPin size={16} className="text-secondary flex-shrink-0" /> Dakar, Sénégal</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-primary flex-shrink-0" /> <a href="mailto:contact1@digital-porokhane.com" className="hover:text-white transition-colors">contact1@digital-porokhane.com</a></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-accent flex-shrink-0" /> <a href="tel:+221338306157" className="hover:text-white transition-colors">+221 33 830 61 57</a></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-accent flex-shrink-0" /> <a href="tel:+221710589088" className="hover:text-white transition-colors">+221 71 058 90 88</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Nafissa. Tous droits réservés.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link to="/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-secondary" />
              <span>Paiements sécurisés &bull; Données protégées</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Invite d'installation PWA : popup discret, aucun bouton permanent,
          ne bloque ni le défilement ni la page. */}
      <InstallPwa />
    </div>
  );
}
