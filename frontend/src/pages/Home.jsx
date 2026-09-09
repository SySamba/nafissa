import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from '../components/BrandMark';
import {
  ArrowRight, Star, Shield, Clock, CreditCard, Users, CheckCircle,
  Sparkles, Baby, Home as HomeIcon, BookOpen, ChefHat, Zap,
  Heart, Phone, MapPin, Mail, ChevronRight, Play, MapPinned, Cpu, LayoutDashboard,
  Shirt, ShoppingCart, Droplets, Hammer
} from 'lucide-react';
import { homepageCategoryVisual } from '../lib/categoryImages';
// Hero image depuis le dossier public/

// Services prioritaires NAFISSA
const PRIORITY_SERVICES = [
  { icon: HomeIcon, slug: 'home', name: 'Ménage', desc: 'Nettoyage professionnel du domicile' },
  { icon: Shirt, slug: 'laundry', name: 'Lavage & Repassage', desc: 'Linge lavé, séché et repassé' },
  { icon: ShoppingCart, slug: 'shopping', name: 'Course', desc: 'Vos achats du quotidien livrés' },
  { icon: Baby, slug: 'baby', name: 'Garde d\'enfant', desc: 'Nounous de confiance' },
  { icon: ChefHat, slug: 'utensils', name: 'Cuisine', desc: 'Repas faits maison' },
];

// Services secondaires NAFISSA
const SECONDARY_SERVICES = [
  { icon: BookOpen, slug: 'book-open', name: 'Soutien scolaire', desc: 'Cours particuliers à domicile' },
  { icon: Zap, slug: 'zap', name: 'Électricien', desc: 'Installation & dépannage' },
  { icon: Droplets, slug: 'plumber', name: 'Plombier', desc: 'Fuites, sanitaires, robinetterie' },
  { icon: Hammer, slug: 'carpenter', name: 'Menuisier', desc: 'Bois, meubles & réparations' },
];

const WORKFLOW_STEPS = [
  { num: '1', title: 'Le client crée une demande', desc: 'Depuis une fiche service, vous déposez vos dates, votre lieu et le détail du besoin.', icon: Sparkles },
  { num: '2', title: 'Détection automatique', desc: 'La plateforme relie localisation et catégorie de service pour cadrer la mission.', icon: MapPinned },
  { num: '3', title: 'Calcul intelligent', desc: 'Le moteur met en avant les prestataires proches, disponibles et mieux notés.', icon: Cpu },
  { num: '4', title: 'Tableau administrateur', desc: 'L’admin consulte une short-list des meilleurs candidats pour la mission.', icon: LayoutDashboard },
  { num: '5', title: 'Validation & attribution', desc: 'Une personne dédiée valide et attribue le prestataire — comme sur votre parcours historique Laravel.', icon: Shield },
];

function renderServiceCard({ icon: Icon, name, desc, slug }, user) {
  const { image, gradient, emoji } = homepageCategoryVisual(slug);
  return (
    <Link
      to={user ? '/services' : '/register'}
      key={name}
      className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-gray-200/90 bg-white shadow-md ring-1 ring-black/[0.04] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      <div className={`relative h-36 w-full shrink-0 overflow-hidden bg-gradient-to-br ${gradient} sm:h-44`}>
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-90 transition-transform duration-700 ease-out group-hover:scale-110">
            {emoji}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-4 pb-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5">
            <Icon size={18} className="text-primary" aria-hidden />
          </span>
          <p className="text-base font-bold text-white drop-shadow">{name}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-gray-500 line-clamp-2">{desc}</p>
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-50">
          <span className="text-xs font-bold text-primary">Voir les offres</span>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-secondary group-hover:translate-x-0.5 transition-all" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-28">
          <BrandMark to="/" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#how" className="hover:text-primary transition-colors">Comment ça marche</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
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
                <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
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
                Ménage, garde d&apos;enfants, cuisine, lavage… Trouvez des prestataires <strong className="text-gray-700">vérifiés et notés</strong> pour tous vos besoins, en toute confiance.
              </p>

              {/* CTA Buttons */}
              <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0">
                  Trouver un prestataire <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-secondary/10 hover:bg-secondary/15 text-secondary px-8 py-4 rounded-2xl text-base font-bold transition-all border border-secondary/20 hover:border-secondary/40">
                  <Play size={16} fill="currentColor" /> Devenir prestataire
                </Link>
              </div>

              {/* Stats bar */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl px-6 py-5 shadow-xl shadow-gray-200/50 max-w-xl mx-auto lg:mx-0">
                {[
                  { value: '500+', label: 'Familles', icon: Heart, color: 'text-rose-500' },
                  { value: '200+', label: 'Prestataires', icon: Users, color: 'text-primary' },
                  { value: '1 000+', label: 'Missions', icon: CheckCircle, color: 'text-secondary' },
                  { value: '4.8/5', label: 'Satisfaction', icon: Star, color: 'text-amber-500' },
                ].map(({ value, label, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`${color}`}><Icon size={20} /></div>
                    <div className="text-left">
                      <p className="text-lg font-extrabold text-gray-900 leading-tight">{value}</p>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                    </div>
                  </div>
                ))}
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
            <span className="flex items-center gap-2"><Shield size={16} className="text-secondary" /> Prestataires vérifiés</span>
            <span className="flex items-center gap-2"><CreditCard size={16} className="text-primary" /> Paiement sécurisé</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-accent" /> Réponse en 24h</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-amber-500 fill-amber-500" /> Avis clients vérifiés</span>
            <span className="flex items-center gap-2"><Heart size={16} className="text-rose-500" /> Service garanti</span>
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
              <Star size={13} className="fill-primary" /> Services prioritaires
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {PRIORITY_SERVICES.map((svc) => renderServiceCard(svc, user))}
          </div>

          {/* Services secondaires */}
          <div className="mt-16 mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-dark">
              <Sparkles size={13} /> Services secondaires
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SECONDARY_SERVICES.map((svc) => renderServiceCard(svc, user))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-bold text-sm uppercase tracking-wider mb-3">Architecture recommandée</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Workflow <span className="text-secondary">en 5 étapes</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Ce parcours s’applique à l’ensemble de la plateforme — y compris l’exploration gratuite des offres : la création du compte ne change pas le fonctionnement après connexion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            {WORKFLOW_STEPS.map(({ num, title, desc, icon: StepIcon }, i) => (
              <div key={num} className="relative group">
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="hidden xl:block absolute top-11 left-[calc(100%+2px)] w-[calc(100%-20px)] h-0.5 z-0">
                    <div className="w-full h-full bg-gradient-to-r from-primary/25 to-secondary/25 rounded-full" />
                  </div>
                )}
                <div className="relative z-[1] bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <StepIcon size={20} className="text-white" />
                      </div>
                      <span className="absolute -top-1 -right-1 min-w-[1.375rem] h-6 px-1 bg-accent text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-md">
                        {num}
                      </span>
                    </div>
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
                icon: Shield,
                title: 'Prestataires vérifiés',
                desc: 'Chaque prestataire fournit sa pièce d\'identité et est validé par notre équipe avant de pouvoir proposer ses services.',
                color: 'from-secondary to-secondary-dark',
                shadow: 'shadow-secondary/20',
              },
              {
                icon: CreditCard,
                title: 'Paiement sécurisé',
                desc: 'Votre paiement est retenu en sécurité et n\'est libéré au prestataire qu\'après votre confirmation de satisfaction.',
                color: 'from-primary to-primary-dark',
                shadow: 'shadow-primary/20',
              },
              {
                icon: Clock,
                title: 'Suivi en temps réel',
                desc: 'Suivez l\'avancement de votre demande étape par étape, de l\'attribution du prestataire à la fin de la mission.',
                color: 'from-accent to-amber-600',
                shadow: 'shadow-accent/20',
              },
            ].map(({ icon: Icon, title, desc, color, shadow }) => (
              <div key={title} className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl ${shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
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
                <Sparkles size={14} /> Rejoignez la communauté
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
                <li className="flex items-center gap-3"><Mail size={16} className="text-primary flex-shrink-0" /> contact@nafissa.sn</li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-accent flex-shrink-0" /> +221 77 000 00 00</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Nafissa. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-secondary" />
              <span>Paiements sécurisés &bull; Données protégées</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
