import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import {
  Users, Calendar, CreditCard, Shield, CheckCircle, XCircle,
  UserCheck, Ban, ChevronDown, ChevronUp, ClipboardList, MapPin, Star, UserPlus, FileImage,
  Eye, X, Phone, Mail, Briefcase
} from 'lucide-react';

const ROLE_LABELS = { maman: 'Cliente', etudiant: 'Prestataire (étudiant)', artisan: 'Prestataire', admin: 'Admin' };

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [suggestedProviders, setSuggestedProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dossierProvider, setDossierProvider] = useState(null);

  const fetchTabData = useCallback(() => {
    if (tab === 'dashboard') {
      adminAPI.dashboard()
        .then(({ data }) => setStats(data.stats))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'pending') {
      adminAPI.pendingUsers()
        .then(({ data }) => setPendingUsers(data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'users') {
      adminAPI.users()
        .then(({ data }) => setAllUsers(data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'bookings') {
      adminAPI.pendingBookings()
        .then(({ data }) => setPendingBookings(data.bookings || data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    fetchTabData();
  }, [fetchTabData]);
  usePolling(fetchTabData, 12000, [tab]);

  const handleValidate = async (userId) => {
    setActionLoading(`validate-${userId}`);
    try {
      await adminAPI.validateUser(userId);
      setMessage({ type: 'success', text: 'Compte validé avec succès.' });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(`reject-${userId}`);
    try {
      await adminAPI.rejectUser(userId, rejectReason);
      setMessage({ type: 'success', text: 'Compte refusé.' });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setExpandedUser(null);
      setRejectReason('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleSuspend = async (userId) => {
    setActionLoading(`suspend-${userId}`);
    try {
      await adminAPI.suspendUser(userId);
      setMessage({ type: 'success', text: 'Utilisateur suspendu.' });
      setAllUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, profile: { ...u.profile, status: 'suspended' } } : u
      ));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  const bookingIdKey = (id) => String(id);

  const handleExpandBooking = async (bookingId) => {
    const key = bookingIdKey(bookingId);
    if (expandedBooking === key) {
      setExpandedBooking(null);
      return;
    }
    setExpandedBooking(key);
    if (!suggestedProviders[key]) {
      try {
        const { data } = await adminAPI.suggestProviders(bookingId);
        setSuggestedProviders((prev) => ({ ...prev, [key]: data.providers || [] }));
      } catch {
        setSuggestedProviders((prev) => ({ ...prev, [key]: [] }));
      }
    }
  };

  const handleAssignProvider = async (bookingId, providerId) => {
    setActionLoading(`assign-${bookingId}-${providerId}`);
    try {
      await adminAPI.assignProvider(bookingId, providerId);
      setMessage({ type: 'success', text: 'Prestataire attribué avec succès.' });
      const idKey = String(bookingId);
      setPendingBookings((prev) => prev.filter((b) => String(b.id) !== idKey));
      setExpandedBooking(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'attribution.' });
    } finally {
      setActionLoading('');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Shield },
    { id: 'bookings', label: 'Attribuer prestataire', icon: ClipboardList },
    { id: 'pending', label: 'Comptes', icon: UserCheck },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light px-4 py-5 text-white shadow-xl shadow-primary/20 sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -left-20 -top-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-secondary-light ring-1 ring-white/15 mb-3">
            <Shield size={12} /> Administration
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Pilotage de la plateforme</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
            Les mamans envoient des demandes sans prestataire ; les réservations en
            <span className="font-semibold text-secondary-light"> « en attente admin » </span>
            se traitent dans l&apos;onglet ci-dessous — choix du prestataire puis envoi à sa confirmation.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-65" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            Rafraîchissement automatique des listes
          </div>
        </div>
      </section>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-surface text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-danger'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />} {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Tableau de bord */}
          {tab === 'dashboard' && stats && (
            <>
              {stats.pending_bookings > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-amber-900">{stats.pending_bookings} demande(s) à attribuer</p>
                    <p className="text-sm text-amber-800/90 mt-0.5">
                      Choisissez un prestataire dans l&apos;onglet suivant ; il recevra la mission à accepter ou refuser.
                    </p>
                  </div>
                  <button type="button" onClick={() => setTab('bookings')}
                    className="shrink-0 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <ClipboardList size={18} /> Ouvrir l&apos;attribution
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Utilisateurs', value: stats.total_users, icon: Users, wrap: 'bg-primary/15 text-primary' },
                { label: 'Comptes en attente', value: stats.pending_accounts, icon: UserCheck, wrap: 'bg-amber-100 text-amber-800' },
                { label: 'Réservations', value: stats.total_bookings, icon: Calendar, wrap: 'bg-secondary/15 text-secondary' },
                { label: 'Réservations actives', value: stats.active_bookings, icon: Calendar, wrap: 'bg-primary/15 text-primary' },
                { label: 'Commissions (FCFA)', value: Number(stats.total_revenue).toLocaleString(), icon: CreditCard, wrap: 'bg-secondary/15 text-secondary' },
                { label: 'Volume total (FCFA)', value: Number(stats.total_payments).toLocaleString(), icon: CreditCard, wrap: 'bg-amber-100 text-amber-800' },
              ].map(({ label, value, icon: Icon, wrap }) => (
                <div key={label} className="rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${wrap}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-bold tabular-nums text-gray-900">{value}</p>
                      <p className="text-sm text-gray-500">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}

          {/* Demandes en en_attente_admin — équivalent Laravel AdminController @pendingBookings + assign */}
          {tab === 'bookings' && (
            pendingBookings.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-2xl border border-gray-200/70">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4">
                  <ClipboardList size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aucune demande en attente</h3>
                <p className="text-gray-500 text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                  Les réservations au statut « en attente admin » apparaîtront ici dès qu&apos;une cliente fera une demande.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Dépliez une ligne puis cliquez sur <span className="font-semibold text-gray-700">Attribuer</span> à côté du prestataire choisi.
                </p>
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="bg-surface rounded-2xl border border-gray-200/70 overflow-hidden transition hover:shadow-md">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">En attente</span>
                            <span className="text-xs text-gray-400 font-mono">#{booking.id}</span>
                          </div>
                          <h3 className="font-bold text-gray-900">{booking.service?.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{booking.service?.category?.name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.booking_date).toLocaleDateString('fr-FR')}</span>
                            <span>{booking.booking_time}</span>
                            {booking.location && <span className="flex items-center gap-1"><MapPin size={14} /> {booking.location}</span>}
                          </div>
                          {booking.description && (
                            <p className="mt-2.5 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">{booking.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {booking.client?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{booking.client?.name}</span>
                            <span className="text-xs text-gray-400">{booking.client?.phone}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-secondary">{Number(booking.total_price).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button type="button" onClick={() => handleExpandBooking(booking.id)}
                          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                          <UserPlus size={16} /> Attribuer un prestataire
                          {expandedBooking === bookingIdKey(booking.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Liste des prestataires suggérés */}
                    {expandedBooking === bookingIdKey(booking.id) && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50/80">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Prestataires disponibles pour cette catégorie</h4>
                        {!suggestedProviders[bookingIdKey(booking.id)] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : suggestedProviders[bookingIdKey(booking.id)].length === 0 ? (
                          <p className="text-sm text-gray-500 py-2">Aucun prestataire disponible pour cette catégorie.</p>
                        ) : (
                          <div className="space-y-2">
                            {suggestedProviders[bookingIdKey(booking.id)].map((provider) => (
                              <div key={provider.id} className="bg-surface rounded-xl border border-gray-200/70 p-3.5 transition hover:border-primary/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark text-white rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
                                      {provider.photo ? <img src={`/storage/${provider.photo}`} alt="" className="w-full h-full object-cover" /> : provider.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">{provider.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{provider.phone}</span>
                                        {provider.rating > 0 && (
                                          <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} fill="currentColor" /> {provider.rating}</span>
                                        )}
                                        <span>{provider.missions_terminees} mission(s)</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => setDossierProvider(provider)}
                                      className="flex items-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors">
                                      <Eye size={14} /> Dossier
                                    </button>
                                    <button
                                      onClick={() => handleAssignProvider(booking.id, provider.id)}
                                      disabled={!!actionLoading}
                                      className="flex items-center gap-1 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                                      {actionLoading === `assign-${booking.id}-${provider.id}` ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <><CheckCircle size={14} /> Attribuer</>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Comptes en attente */}
          {tab === 'pending' && (
            pendingUsers.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-2xl border border-gray-200/70">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-green-100 text-green-600 mb-4">
                  <UserCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aucun compte en attente</h3>
                <p className="text-gray-500 text-sm mt-1.5">Tous les comptes prestataires ont été traités.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="bg-surface rounded-2xl border border-gray-200/70 p-4 sm:p-5 transition hover:shadow-md">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {ROLE_LABELS[user.role]}
                            </span>
                            {user.phone && <span className="text-xs text-gray-400">{user.phone}</span>}
                            {user.address && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin size={10} /> {user.address}</span>}
                          </div>
                          {/* Pièce d'identité */}
                          {(user.id_card_recto || user.id_card_verso) ? (
                            <div className="flex items-center gap-3 mt-2">
                              <FileImage size={14} className="text-primary" />
                              <span className="text-xs font-semibold text-gray-600">Pièce d&apos;identité :</span>
                              {user.id_card_recto && (
                                <a href={`/storage/${user.id_card_recto}`} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-semibold">Recto</a>
                              )}
                              {user.id_card_verso && (
                                <a href={`/storage/${user.id_card_verso}`} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-semibold">Verso</a>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-danger mt-2 flex items-center gap-1">
                              <XCircle size={12} /> Aucune pièce d&apos;identité fournie
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button onClick={() => handleValidate(user.id)} disabled={!!actionLoading}
                          className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 bg-secondary hover:bg-secondary-dark text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                          {actionLoading === `validate-${user.id}` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={15} /> Valider</>}
                        </button>
                        <button onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 border border-gray-200 text-danger hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                          <XCircle size={15} /> Refuser
                          {expandedUser === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                    {expandedUser === user.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Raison du refus (optionnel)..." rows={2}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                        <button onClick={() => handleReject(user.id)} disabled={!!actionLoading}
                          className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                          {actionLoading === `reject-${user.id}` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirmer le refus'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tous les utilisateurs */}
          {tab === 'users' && (
            <div className="bg-surface rounded-2xl border border-gray-200/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="text-left px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Utilisateur</th>
                      <th className="text-left px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Rôle</th>
                      <th className="text-left px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Adresse</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Inscrit le</th>
                      <th className="text-right px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="transition hover:bg-gray-50/50">
                        <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            user.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {user.verified ? 'Vérifié' : 'En attente'}
                          </span>
                          {user.profile?.status === 'suspended' && (
                            <span className="ml-1 text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Suspendu</span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-5 py-3.5 text-gray-500 text-xs">
                          {user.address || '-'}
                        </td>
                        <td className="hidden sm:table-cell px-5 py-3.5 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-3 py-3 sm:px-5 sm:py-3.5 text-right">
                          {user.role !== 'admin' && user.profile?.status !== 'suspended' && (
                            <button onClick={() => handleSuspend(user.id)} disabled={!!actionLoading}
                              className="text-xs text-danger hover:text-red-700 font-bold disabled:opacity-50">
                              {actionLoading === `suspend-${user.id}` ? '...' : <><Ban size={12} className="inline mr-1" />Suspendre</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Modal Dossier Prestataire ─── */}
      {dossierProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDossierProvider(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Dossier du prestataire</h2>
              <button onClick={() => setDossierProvider(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Profil principal */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary-dark text-white rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
                  {dossierProvider.photo
                    ? <img src={`/storage/${dossierProvider.photo}`} alt="" className="w-full h-full object-cover" />
                    : dossierProvider.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{dossierProvider.name}</h3>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {ROLE_LABELS[dossierProvider.role]}
                  </span>
                  {dossierProvider.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16} className={s <= Math.round(dossierProvider.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      ))}
                      <span className="text-sm font-bold text-gray-700 ml-1">{dossierProvider.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gray-50/80 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Informations personnelles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-primary" />
                    <span>{dossierProvider.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-primary" />
                    <span>{dossierProvider.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-primary" />
                    <span>{dossierProvider.address || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-primary" />
                    <span>{dossierProvider.gender === 'homme' ? 'Homme' : dossierProvider.gender === 'femme' ? 'Femme' : 'Non renseigné'}</span>
                  </div>
                  {dossierProvider.date_of_birth && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="text-primary" />
                      <span>Né(e) le {new Date(dossierProvider.date_of_birth).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-primary" />
                    <span>Inscrit le {new Date(dossierProvider.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-secondary">{dossierProvider.missions_terminees}</p>
                  <p className="text-xs text-gray-500 mt-1">Missions terminées</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{dossierProvider.services_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Services proposés</p>
                </div>
              </div>

              {/* Bio */}
              {dossierProvider.bio && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Bio</h4>
                  <p className="text-sm text-gray-600 bg-gray-50/80 rounded-xl p-3 leading-relaxed">{dossierProvider.bio}</p>
                </div>
              )}

              {/* Pièce d'identité */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileImage size={16} className="text-primary" /> Pièce d&apos;identité
                </h4>
                {(dossierProvider.id_card_recto || dossierProvider.id_card_verso) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {dossierProvider.id_card_recto && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <p className="text-xs font-bold text-gray-500 px-3 py-1.5 bg-gray-50">Recto</p>
                        {dossierProvider.id_card_recto.endsWith('.pdf') ? (
                          <a href={`/storage/${dossierProvider.id_card_recto}`} target="_blank" rel="noopener noreferrer"
                            className="block p-4 text-center text-primary text-sm font-bold hover:bg-primary/5">
                            <FileImage size={32} className="mx-auto mb-1" /> Voir le PDF
                          </a>
                        ) : (
                          <a href={`/storage/${dossierProvider.id_card_recto}`} target="_blank" rel="noopener noreferrer">
                            <img src={`/storage/${dossierProvider.id_card_recto}`} alt="Recto" className="w-full h-32 object-cover" />
                          </a>
                        )}
                      </div>
                    )}
                    {dossierProvider.id_card_verso && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <p className="text-xs font-bold text-gray-500 px-3 py-1.5 bg-gray-50">Verso</p>
                        {dossierProvider.id_card_verso.endsWith('.pdf') ? (
                          <a href={`/storage/${dossierProvider.id_card_verso}`} target="_blank" rel="noopener noreferrer"
                            className="block p-4 text-center text-primary text-sm font-bold hover:bg-primary/5">
                            <FileImage size={32} className="mx-auto mb-1" /> Voir le PDF
                          </a>
                        ) : (
                          <a href={`/storage/${dossierProvider.id_card_verso}`} target="_blank" rel="noopener noreferrer">
                            <img src={`/storage/${dossierProvider.id_card_verso}`} alt="Verso" className="w-full h-32 object-cover" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-danger flex items-center gap-2 bg-red-50 p-3 rounded-xl">
                    <XCircle size={16} /> Aucune pièce d&apos;identité fournie
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3.5 sm:px-6 sm:py-4 rounded-b-2xl">
              <button onClick={() => setDossierProvider(null)}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
