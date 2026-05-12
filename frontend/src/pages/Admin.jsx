import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import {
  Users, Calendar, CreditCard, Shield, CheckCircle, XCircle,
  UserCheck, Ban, ChevronDown, ChevronUp, ClipboardList, MapPin, Star, UserPlus, FileImage,
  Eye, X, Phone, Mail, Briefcase
} from 'lucide-react';

const ROLE_LABELS = { maman: 'Maman', etudiant: 'Étudiant', artisan: 'Artisan', admin: 'Admin' };

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
  usePolling(fetchTabData, 15000, [tab]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-muted text-sm mt-1">Gérez la plateforme Nafissa</p>
        <p className="text-muted text-xs mt-2 max-w-2xl">
          Comme sur Laravel : les mamans envoient une demande sans prestataire ; les réservations en
          <span className="font-medium text-gray-700"> « en attente admin » </span>
          se traitent dans l&apos;onglet ci-dessous — choix du prestataire puis envoi à sa confirmation.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-gray-700'
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
                { label: 'Utilisateurs', value: stats.total_users, icon: Users, color: 'primary' },
                { label: 'Comptes en attente', value: stats.pending_accounts, icon: UserCheck, color: 'accent' },
                { label: 'Réservations', value: stats.total_bookings, icon: Calendar, color: 'secondary' },
                { label: 'Réservations actives', value: stats.active_bookings, icon: Calendar, color: 'primary' },
                { label: 'Commissions (FCFA)', value: Number(stats.total_revenue).toLocaleString(), icon: CreditCard, color: 'secondary' },
                { label: 'Volume total (FCFA)', value: Number(stats.total_payments).toLocaleString(), icon: CreditCard, color: 'accent' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-surface rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${color}/10 text-${color} rounded-lg flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-muted">{label}</p>
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
              <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
                <ClipboardList size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Aucune demande en attente d&apos;attribution</h3>
                <p className="text-muted text-sm mt-1 max-w-md mx-auto">
                  Seules les réservations au statut « en attente admin » (après demande maman) apparaissent ici.
                  Si vous voyez ce message alors qu&apos;il devrait y en avoir, vérifiez le statut en base ou créez une nouvelle demande depuis une maman.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Dépliez une ligne puis cliquez sur <span className="font-medium text-gray-700">Attribuer</span> à côté du prestataire choisi.
                </p>
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="bg-surface rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">En attente</span>
                            <span className="text-xs text-muted">#{booking.id}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{booking.service?.title}</h3>
                          <p className="text-sm text-muted mt-1">{booking.service?.category?.name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.booking_date).toLocaleDateString('fr-FR')}</span>
                            <span>{booking.booking_time}</span>
                            {booking.location && <span className="flex items-center gap-1"><MapPin size={14} /> {booking.location}</span>}
                          </div>
                          {booking.description && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{booking.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                              {booking.client?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{booking.client?.name}</span>
                            <span className="text-xs text-muted">{booking.client?.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-secondary">{Number(booking.total_price).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button type="button" onClick={() => handleExpandBooking(booking.id)}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                          <UserPlus size={16} /> Attribuer un prestataire
                          {expandedBooking === bookingIdKey(booking.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Liste des prestataires suggérés */}
                    {expandedBooking === bookingIdKey(booking.id) && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Prestataires disponibles pour cette catégorie</h4>
                        {!suggestedProviders[bookingIdKey(booking.id)] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : suggestedProviders[bookingIdKey(booking.id)].length === 0 ? (
                          <p className="text-sm text-muted py-2">Aucun prestataire disponible pour cette catégorie.</p>
                        ) : (
                          <div className="space-y-2">
                            {suggestedProviders[bookingIdKey(booking.id)].map((provider) => (
                              <div key={provider.id} className="bg-surface rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
                                      {provider.photo ? <img src={`/storage/${provider.photo}`} alt="" className="w-full h-full object-cover" /> : provider.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted">
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
                                      className="flex items-center gap-1 border border-primary text-primary hover:bg-primary/5 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                                      <Eye size={14} /> Dossier
                                    </button>
                                    <button
                                      onClick={() => handleAssignProvider(booking.id, provider.id)}
                                      disabled={!!actionLoading}
                                      className="flex items-center gap-1 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
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
              <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
                <UserCheck size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Aucun compte en attente</h3>
                <p className="text-muted text-sm mt-1">Tous les comptes prestataires ont été traités.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="bg-surface rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-lg font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-muted">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {ROLE_LABELS[user.role]}
                            </span>
                            {user.phone && <span className="text-xs text-muted">{user.phone}</span>}
                            {user.address && <span className="text-xs text-muted flex items-center gap-0.5"><MapPin size={10} /> {user.address}</span>}
                          </div>
                          {/* Pièce d'identité */}
                          {(user.id_card_recto || user.id_card_verso) ? (
                            <div className="flex items-center gap-3 mt-2">
                              <FileImage size={14} className="text-primary" />
                              <span className="text-xs font-medium text-gray-600">Pièce d&apos;identité :</span>
                              {user.id_card_recto && (
                                <a href={`/storage/${user.id_card_recto}`} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-medium">Recto</a>
                              )}
                              {user.id_card_verso && (
                                <a href={`/storage/${user.id_card_verso}`} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-medium">Verso</a>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-danger mt-2 flex items-center gap-1">
                              <XCircle size={12} /> Aucune pièce d&apos;identité fournie
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleValidate(user.id)} disabled={!!actionLoading}
                          className="flex items-center gap-1 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          {actionLoading === `validate-${user.id}` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={14} /> Valider</>}
                        </button>
                        <button onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="flex items-center gap-1 border border-danger text-danger hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <XCircle size={14} /> Refuser
                          {expandedUser === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                    {expandedUser === user.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Raison du refus (optionnel)..." rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                        <button onClick={() => handleReject(user.id)} disabled={!!actionLoading}
                          className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
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
            <div className="bg-surface rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 font-medium text-muted">Utilisateur</th>
                      <th className="text-left px-5 py-3 font-medium text-muted">Rôle</th>
                      <th className="text-left px-5 py-3 font-medium text-muted">Statut</th>
                      <th className="text-left px-5 py-3 font-medium text-muted">Adresse</th>
                      <th className="text-left px-5 py-3 font-medium text-muted">Inscrit le</th>
                      <th className="text-right px-5 py-3 font-medium text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            user.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {user.verified ? 'Vérifié' : 'En attente'}
                          </span>
                          {user.profile?.status === 'suspended' && (
                            <span className="ml-1 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Suspendu</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted text-xs">
                          {user.address || '-'}
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {user.role !== 'admin' && user.profile?.status !== 'suspended' && (
                            <button onClick={() => handleSuspend(user.id)} disabled={!!actionLoading}
                              className="text-xs text-danger hover:text-red-700 font-medium disabled:opacity-50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDossierProvider(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Dossier du prestataire</h2>
              <button onClick={() => setDossierProvider(null)} className="text-muted hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profil principal */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
                  {dossierProvider.photo
                    ? <img src={`/storage/${dossierProvider.photo}`} alt="" className="w-full h-full object-cover" />
                    : dossierProvider.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{dossierProvider.name}</h3>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                    {ROLE_LABELS[dossierProvider.role]}
                  </span>
                  {dossierProvider.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16} className={s <= Math.round(dossierProvider.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      ))}
                      <span className="text-sm font-semibold text-gray-700 ml-1">{dossierProvider.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Informations personnelles</h4>
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
                  <p className="text-xs text-muted mt-1">Missions terminées</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{dossierProvider.services_count || 0}</p>
                  <p className="text-xs text-muted mt-1">Services proposés</p>
                </div>
              </div>

              {/* Bio */}
              {dossierProvider.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Bio</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{dossierProvider.bio}</p>
                </div>
              )}

              {/* Pièce d'identité */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileImage size={16} className="text-primary" /> Pièce d&apos;identité
                </h4>
                {(dossierProvider.id_card_recto || dossierProvider.id_card_verso) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {dossierProvider.id_card_recto && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <p className="text-xs font-medium text-gray-500 px-3 py-1.5 bg-gray-50">Recto</p>
                        {dossierProvider.id_card_recto.endsWith('.pdf') ? (
                          <a href={`/storage/${dossierProvider.id_card_recto}`} target="_blank" rel="noopener noreferrer"
                            className="block p-4 text-center text-primary text-sm font-medium hover:bg-primary/5">
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
                        <p className="text-xs font-medium text-gray-500 px-3 py-1.5 bg-gray-50">Verso</p>
                        {dossierProvider.id_card_verso.endsWith('.pdf') ? (
                          <a href={`/storage/${dossierProvider.id_card_verso}`} target="_blank" rel="noopener noreferrer"
                            className="block p-4 text-center text-primary text-sm font-medium hover:bg-primary/5">
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
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
              <button onClick={() => setDossierProvider(null)}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
