import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../api/services';
import { Bell, CheckCheck, Calendar, CreditCard, Shield, User, BookOpen, ExternalLink } from 'lucide-react';

const TYPE_CONFIG = {
  booking: { icon: Calendar, color: 'text-primary bg-primary/10' },
  payment: { icon: CreditCard, color: 'text-secondary bg-secondary/10' },
  reminder: { icon: BookOpen, color: 'text-accent bg-accent/10' },
  dispute: { icon: Shield, color: 'text-danger bg-red-100' },
  account: { icon: User, color: 'text-primary bg-primary/10' },
};

function linkCta(actionLink, type) {
  if (!actionLink) return 'Ouvrir';
  if (actionLink.startsWith('/bookings/')) return 'Voir la réservation';
  if (actionLink.startsWith('/payments')) return 'Voir le paiement';
  if (actionLink === '/profile') return 'Voir mon profil';
  if (actionLink === '/dashboard') return 'Tableau de bord';
  if (actionLink.startsWith('/admin')) return 'Administration';
  if (type === 'payment') return 'Voir la réservation';
  return 'Ouvrir la page';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchNotifications = () => {
    setLoading(true);
    notificationAPI.list({ page })
      .then(({ data }) => {
        setNotifications(data.data || []);
        setLastPage(data.last_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, [page]);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-muted text-sm mt-1">{unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Tout est à jour'}</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors">
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
          <Bell size={48} className="mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucune notification</h3>
          <p className="text-muted text-sm mt-1">Vous serez notifié des événements importants ici.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-gray-100 divide-y divide-gray-50">
          {notifications.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.account;
            const Icon = cfg.icon;
            const href = notif.action_link?.trim?.() || '';
            const cta = linkCta(href, notif.type);
            return (
              <div key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${!notif.read ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" aria-hidden />}
                  </div>
                  <p className="text-sm text-muted mt-0.5">{notif.message}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                    <p className="text-xs text-muted">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {href && (
                      <Link to={href} onClick={() => { if (!notif.read) handleMarkRead(notif.id); }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
                        {cta} <ExternalLink size={14} aria-hidden />
                      </Link>
                    )}
                    {!notif.read && (
                      <button type="button" onClick={() => handleMarkRead(notif.id)}
                        className="text-xs text-muted hover:text-gray-700 underline">
                        Marquer lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Précédent
          </button>
          <span className="text-sm text-muted">Page {page} / {lastPage}</span>
          <button type="button" disabled={page >= lastPage} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
