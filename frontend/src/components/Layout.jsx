import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';
import { notificationAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Home,
  Calendar,
  CreditCard,
  Shield,
  ChevronDown,
  ExternalLink,
  FilePlus2,
  CheckCircle,
  Briefcase,
  ClipboardList,
  CalendarDays,
  Wallet,
  LifeBuoy,
} from 'lucide-react';

const ROLE_LABELS = {
  maman: 'Cliente',
  etudiant: 'Prestataire (étudiant)',
  artisan: 'Prestataire',
  admin: 'Administrateur',
};

export default function Layout({ children }) {
  const { user, logout, isAdmin, isMaman } = useAuth();
  const navigate = useNavigate();
  const homePath = user ? '/dashboard' : '/';
  const location = useLocation();
  const [asideOpen, setAsideOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    if (!user) return;
    notificationAPI
      .unreadCount()
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, location.pathname]);

  usePolling(refreshUnread, 12000, [user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = (() => {
    const common = [
      { to: '/notifications', label: 'Notifications', desc: 'Quand une demande évolue ou qu\'une réservation est confirmée.', icon: Bell, badge: unreadCount },
      { to: '/profile', label: 'Mon profil', desc: 'Informations, adresse et coordonnées.', icon: User },
    ];
    if (!user) {
      return [
        { to: '/', label: 'Accueil', icon: Home },
        { to: '/demande', label: 'Faire une demande', desc: 'Décrire votre besoin en quelques champs.', icon: FilePlus2 },
      ];
    }
    if (isMaman) {
      return [
        { to: '/dashboard', label: 'Tableau de bord', desc: 'Résumé des demandes, réservations et prochaines interventions.', icon: Home },
        { to: '/demande', label: 'Nouvelle demande', desc: 'Décrire un besoin de ménage, cuisine, garde d\'enfants ou autre service.', icon: FilePlus2 },
        { to: '/bookings', label: 'Mes demandes', desc: 'Demandes en attente, en cours d\'attribution ou traitées.', icon: ClipboardList },
        { to: '/bookings?vue=reservations', label: 'Mes réservations', desc: 'Interventions confirmées, passées ou annulées.', icon: CheckCircle },
        { to: '/payments', label: 'Mes paiements', desc: 'Montants, statuts de paiement et reçus disponibles.', icon: CreditCard },
        ...common,
      ];
    }
    if (isAdmin) {
      return [
        { to: '/dashboard', label: 'Tableau de bord', icon: Home },
        { to: '/admin', label: 'Administration', desc: 'Attribuer les demandes, valider les comptes.', icon: Shield },
        { to: '/services', label: 'Services', desc: 'Catalogue des offres prestataires.', icon: Briefcase },
        { to: '/bookings', label: 'Réservations', desc: 'Toutes les demandes de la plateforme.', icon: Calendar },
        { to: '/payments', label: 'Paiements', desc: 'Encaissements et libération des fonds.', icon: CreditCard },
        ...common,
      ];
    }
    return [
      { to: '/dashboard', label: 'Tableau de bord', desc: 'Résumé de l\'activité.', icon: Home },
      { to: '/services', label: 'Mes services', desc: 'Créer, modifier et désactiver ses annonces.', icon: Briefcase },
      { to: '/bookings', label: 'Mes missions', desc: 'Consulter les propositions et les missions attribuées.', icon: ClipboardList },
      { to: '/planning', label: 'Mon planning', desc: 'Voir les dates et horaires des interventions.', icon: CalendarDays },
      { to: '/payments', label: 'Mes revenus', desc: 'Suivre les montants gagnés et les paiements reçus.', icon: Wallet },
      ...common,
      { href: '/#contact', label: 'Aide et assistance', desc: 'Contacter l\'équipe Nafissa.', icon: LifeBuoy },
    ];
  })();



  const isActive = (to) => {
    const [path, query] = to.split('?');
    if (query) {
      return location.pathname === path && location.search.includes(query);
    }
    // « Mes demandes » ne doit pas rester actif sur la vue « réservations ».
    if (path === '/bookings' && location.search.includes('vue=reservations')) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const closeMobile = () => setAsideOpen(false);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Logo area */}
      <div className="flex justify-center border-b border-gray-100 px-5 py-3">
        <BrandMark to={homePath} compact logoClassName="h-16 lg:h-20 w-auto max-w-full" onAfterNavigate={closeMobile} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</p>
        {navLinks.map(({ to, href, label, desc, icon: Icon, badge }) => {
          const active = to ? isActive(to) : false;
          const Tag = href ? 'a' : Link;
          const linkProps = href ? { href } : { to };
          return (
            <Tag
              key={to ?? href}
              {...linkProps}
              onClick={closeMobile}
              className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary/8 text-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon size={19} strokeWidth={active ? 2.5 : 2} className={`mt-0.5 shrink-0 ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="min-w-0 flex-1">
                <span className="block">{label}</span>
                {desc && (
                  <span className={`block text-[11px] font-normal leading-snug ${active ? 'text-primary/70' : 'text-gray-400'}`}>
                    {desc}
                  </span>
                )}
              </span>
              {badge > 0 && (
                <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Tag>
          );
        })}
      </nav>

      {/* External link */}
      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMobile}
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <ExternalLink size={17} />
          Voir le site
        </a>
      </div>

      {/* User card */}
      <div className="border-t border-gray-100 px-3 py-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 px-3 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                {user.photo
                  ? <img src={`/storage/${user.photo}`} alt="" className="h-full w-full object-cover" />
                  : user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigate('/profile');
                  closeMobile();
                }}
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
              >
                Profil
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-red-50"
            >
              <LogOut size={17} />
              Déconnexion
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              onClick={closeMobile}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              onClick={closeMobile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {asideOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-[55] bg-black/35 backdrop-blur-[1px] lg:hidden"
          onClick={() => setAsideOpen(false)}
        />
      ) : null}

      {/* Une seule barre latérale : même arbre DOM mobile & desktop (évite saut / double rendu).
          Sur desktop : sticky top-0 h-screen → la sidebar reste immobile pendant que le contenu défile. */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-[60] flex h-[100dvh] w-[min(288px,88vw)] shrink-0 flex-col border-r border-gray-200 bg-surface shadow-2xl transition-transform duration-200 ease-out lg:sticky lg:inset-auto lg:top-0 lg:z-40 lg:h-screen lg:w-72 lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-none ${
          asideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-3 border-b border-gray-200/80 bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:h-14 lg:justify-end lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setAsideOpen((o) => !o)}
              className="rounded-lg p-2 text-muted hover:bg-gray-100 hover:text-primary"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <BrandMark to={homePath} compact logoClassName="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                to="/notifications"
                className="relative rounded-lg p-1.5 text-muted hover:bg-gray-50 hover:text-primary"
              >
                <Bell size={19} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Link>
            )}

            {/* Compact user menu desktop — infos déjà dans la sidebar */}
            {user && (
              <div className="relative hidden sm:block lg:hidden">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-gray-100 px-2 py-1.5 hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User size={14} />
                  </div>
                  <ChevronDown size={14} className="text-muted" />
                </button>
                {userMenuOpen ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40"
                      aria-label="Fermer"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-surface py-1 shadow-xl">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={16} />
                        Mon profil
                      </Link>
                      <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ExternalLink size={16} />
                        Voir le site
                      </a>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:max-w-[1400px] lg:px-10">{children}</main>
      </div>
    </div>
  );
}
