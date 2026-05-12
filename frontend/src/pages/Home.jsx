import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight, Star, Shield, Clock, CreditCard, Users, CheckCircle,
  Sparkles, Baby, Scissors, Home as HomeIcon, BookOpen, Wrench, ChefHat, Zap,
  Heart, Phone, MapPin, Mail, ChevronRight, Play
} from 'lucide-react';

const CATEGORIES = [
  { icon: HomeIcon, name: 'Ménage', desc: 'Nettoyage professionnel', gradient: 'from-blue-500 to-cyan-400' },
  { icon: Baby, name: 'Garde d\'enfants', desc: 'Nounous de confiance', gradient: 'from-pink-500 to-rose-400' },
  { icon: Scissors, name: 'Coiffure', desc: 'À domicile', gradient: 'from-purple-500 to-violet-400' },
  { icon: ChefHat, name: 'Cuisine', desc: 'Repas faits maison', gradient: 'from-orange-500 to-amber-400' },
  { icon: BookOpen, name: 'Soutien scolaire', desc: 'Cours particuliers', gradient: 'from-emerald-500 to-green-400' },
  { icon: Sparkles, name: 'Beauté & Bien-être', desc: 'Soins personnalisés', gradient: 'from-rose-500 to-pink-400' },
  { icon: Wrench, name: 'Réparation', desc: 'Dépannage rapide', gradient: 'from-slate-500 to-gray-400' },
  { icon: Zap, name: 'Électricité', desc: 'Installation & réparation', gradient: 'from-yellow-500 to-amber-400' },
];

const STEPS = [
  { num: '1', title: 'Décrivez votre besoin', desc: 'Choisissez un service, indiquez la date et le lieu souhaités.', icon: Sparkles },
  { num: '2', title: 'On trouve le bon profil', desc: 'Notre équipe sélectionne le prestataire le plus adapté à votre demande.', icon: Users },
  { num: '3', title: 'Confirmation rapide', desc: 'Le prestataire accepte la mission et vous êtes notifié(e) immédiatement.', icon: CheckCircle },
  { num: '4', title: 'Paiement sécurisé', desc: 'Payez en toute sécurité. L\'argent est retenu jusqu\'à votre satisfaction.', icon: Shield },
];

const TESTIMONIALS = [
  { name: 'Fatima Ba', role: 'Maman à Mermoz', text: 'Nafissa m\'a sauvé la vie ! J\'ai trouvé une nounou de confiance en moins de 24h. Le service est impeccable, je recommande vivement.', rating: 5, avatar: 'F' },
  { name: 'Oumar Sy', role: 'Étudiant prestataire', text: 'Grâce à Nafissa, je finance mes études tout en aidant les familles. La plateforme est simple et les paiements toujours à l\'heure.', rating: 5, avatar: 'O' },
  { name: 'Aminata Ndiaye', role: 'Maman à Sacré-Cœur', text: 'Le ménage est fait à la perfection chaque semaine. Le paiement est sécurisé et les prestataires sont vérifiés. 100% satisfaite !', rating: 5, avatar: 'A' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.webp" alt="Nafissa" className="h-10" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900">Nafissa</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#how" className="hover:text-primary transition-colors">Comment ça marche</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Témoignages</a>
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
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-secondary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-secondary/8 to-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/4" />
        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/15 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-8 animate-[fadeIn_0.6s_ease-out]">
              <Heart size={15} className="text-secondary fill-secondary" /> Plateforme N°1 de services à domicile au Sénégal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Votre quotidien,{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">simplifié</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none"><path d="M2 8c30-6 60-6 90-2s70 4 106-2" stroke="url(#g)" strokeWidth="3" strokeLinecap="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="200" y2="0"><stop stopColor="#1B5FAD"/><stop offset="1" stopColor="#2D8E41"/></linearGradient></defs></svg>
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Ménage, garde d&apos;enfants, cuisine, coiffure… Trouvez des prestataires <strong className="text-gray-700">vérifiés et notés</strong> pour tous vos besoins, en toute confiance.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-8 py-4.5 rounded-2xl text-base font-bold transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0">
                Trouver un prestataire <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-secondary/10 hover:bg-secondary/15 text-secondary px-8 py-4.5 rounded-2xl text-base font-bold transition-all border border-secondary/20 hover:border-secondary/40">
                <Play size={16} fill="currentColor" /> Devenir prestataire
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 inline-flex flex-wrap items-center justify-center gap-x-10 gap-y-4 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl px-8 py-5 shadow-xl shadow-gray-200/50">
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
          <div className="text-center mb-16">
            <span className="inline-block text-secondary font-bold text-sm uppercase tracking-wider mb-3">Nos services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Tout pour votre <span className="text-primary">famille</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Des services professionnels à domicile, adaptés à vos besoins</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(({ icon: Icon, name, desc, gradient }) => (
              <Link to={user ? '/services' : '/register'} key={name}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" style={{background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`}} />
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{name}</h3>
                <p className="text-sm text-gray-400 mt-1">{desc}</p>
                <ArrowRight size={16} className="absolute bottom-6 right-6 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
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
              Simple comme <span className="text-secondary">1, 2, 3, 4</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Un processus clair et transparent, du début à la fin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc, icon: StepIcon }, i) => (
              <div key={num} className="relative group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%+4px)] w-[calc(100%-48px)] h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full" />
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <StepIcon size={22} className="text-white" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-accent text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-md">
                        {num}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0F3D6E]" />
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/15 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12">Des chiffres qui parlent</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Familles satisfaites', icon: Heart },
              { value: '200+', label: 'Prestataires vérifiés', icon: Shield },
              { value: '1 000+', label: 'Missions réalisées', icon: CheckCircle },
              { value: '4.8/5', label: 'Note moyenne', icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Icon size={28} className="text-white" />
                </div>
                <p className="text-4xl sm:text-5xl font-extrabold text-white">{value}</p>
                <p className="mt-2 text-white/60 text-sm font-medium">{label}</p>
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
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-bold text-sm uppercase tracking-wider mb-3">Témoignages</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Ils nous font <span className="text-secondary">confiance</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Des centaines de familles et prestataires satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar }) => (
              <div key={name} className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Quote mark */}
                <div className="absolute top-6 right-8 text-6xl font-serif text-primary/10 leading-none">&ldquo;</div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed mb-8 relative z-10">{text}</p>

                <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{name}</p>
                    <p className="text-sm text-gray-400">{role}</p>
                  </div>
                </div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0F3D6E]" />
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
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logo.webp" alt="Nafissa" className="h-10 brightness-200" />
                <span className="text-xl font-extrabold">Nafissa</span>
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
