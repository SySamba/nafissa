import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, paymentAPI, adminAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, CreditCard, Check, MapPin, FileText, Star, UserPlus } from 'lucide-react';

const STATUS_CONFIG = {
  en_attente_admin: { label: 'En attente admin', color: 'bg-amber-100 text-amber-700' },
  en_attente_prestataire: { label: 'En attente prestataire', color: 'bg-orange-100 text-orange-700' },
  acceptee: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  payee: { label: 'Payée', color: 'bg-purple-100 text-purple-700' },
  en_cours: { label: 'En cours', color: 'bg-primary/10 text-primary' },
  terminee: { label: 'Terminée', color: 'bg-green-100 text-green-700' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_METHODS = [
  { value: 'wave', label: 'Wave', icon: '🌊' },
  { value: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { value: 'free_money', label: 'Free Money', icon: '🟢' },
  { value: 'stripe', label: 'Carte bancaire', icon: '💳' },
];

const WORKFLOW_STEPS = [
  { key: 'en_attente_admin', label: 'Demande envoyée' },
  { key: 'en_attente_prestataire', label: 'Prestataire attribué' },
  { key: 'acceptee', label: 'Acceptée par prestataire' },
  { key: 'payee', label: 'Paiement effectué' },
  { key: 'en_cours', label: 'Service en cours' },
  { key: 'terminee', label: 'Service terminé' },
];

function getStepIndex(status) {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [showPayment, setShowPayment] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [suggestedProviders, setSuggestedProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  const fetchBooking = useCallback(() => {
    bookingAPI.show(id)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);
  usePolling(fetchBooking, 10000, [id]);

  useEffect(() => {
    if (!booking || user?.role !== 'admin' || booking.status !== 'en_attente_admin') {
      setSuggestedProviders([]);
      return;
    }
    let cancelled = false;
    setProvidersLoading(true);
    adminAPI.suggestProviders(booking.id)
      .then(({ data }) => {
        if (!cancelled) setSuggestedProviders(data.providers || []);
      })
      .catch(() => {
        if (!cancelled) setSuggestedProviders([]);
      })
      .finally(() => {
        if (!cancelled) setProvidersLoading(false);
      });
    return () => { cancelled = true; };
  }, [booking, user?.role]);

  const handleAssignFromDetail = async (providerId) => {
    setActionLoading(`assign-${providerId}`);
    setMessage({ type: '', text: '' });
    try {
      await adminAPI.assignProvider(id, providerId);
      setMessage({ type: 'success', text: 'Prestataire attribué avec succès.' });
      fetchBooking();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'attribution.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusChange = async (status) => {
    setActionLoading(status);
    setMessage({ type: '', text: '' });
    try {
      await bookingAPI.updateStatus(id, status);
      setMessage({ type: 'success', text: 'Statut mis à jour.' });
      fetchBooking();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  const handlePayment = async () => {
    setActionLoading('payment');
    setMessage({ type: '', text: '' });
    try {
      await paymentAPI.create({ booking_id: Number(id), method: paymentMethod });
      setMessage({ type: 'success', text: 'Paiement effectué avec succès !' });
      setShowPayment(false);
      fetchBooking();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur de paiement.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleRate = async () => {
    if (ratingValue < 1) return;
    setActionLoading('rate');
    setMessage({ type: '', text: '' });
    try {
      await bookingAPI.rate(id, { rating: ratingValue, review: reviewText || null });
      setMessage({ type: 'success', text: 'Merci pour votre évaluation !' });
      setShowRating(false);
      fetchBooking();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleRelease = async () => {
    if (!booking?.payment?.id) return;
    setActionLoading('release');
    setMessage({ type: '', text: '' });
    try {
      await paymentAPI.release(booking.payment.id);
      setMessage({ type: 'success', text: 'Paiement libéré au prestataire.' });
      fetchBooking();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.en_attente_admin;
  const isClient = String(booking.client_id) === String(user?.id);
  const isProvider =
    booking.provider_id != null && String(booking.provider_id) === String(user?.id);
  const isAdminRole = user?.role === 'admin';
  const currentStep = getStepIndex(booking.status);
  const isCancelled = booking.status === 'annulee' || booking.status === 'refusee';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour aux réservations
      </button>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-danger'}`}>
          {message.type === 'success' ? <Check size={18} /> : <XCircle size={18} />} {message.text}
        </div>
      )}

      {/* Suivi du workflow */}
      {!isCancelled && (
        <div className="bg-surface rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Suivi de la demande</h2>
          <div className="flex items-center gap-1">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i <= currentStep ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] text-center leading-tight ${i <= currentStep ? 'text-primary font-medium' : 'text-muted'}`}>{step.label}</span>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`hidden sm:block absolute h-0.5 w-full ${i < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info réservation */}
      <div className="bg-surface rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Demande #{booking.id}</h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{booking.service?.title}</h3>
            <p className="text-sm text-muted">{booking.service?.category?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted" />
              <span>{new Date(booking.booking_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-muted" />
              <span>{booking.booking_time}</span>
            </div>
          </div>

          {booking.location && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={16} /> {booking.location}
            </div>
          )}

          {booking.description && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-muted font-medium mb-1 flex items-center gap-1"><FileText size={14} /> Description du besoin</p>
              <p className="text-sm text-gray-700">{booking.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-muted">Montant total</span>
            <span className="text-xl font-bold text-secondary">{Number(booking.total_price).toLocaleString()} FCFA</span>
          </div>

          {booking.notes && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-muted font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}

          {/* Participants */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted font-medium mb-2">Client</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  {booking.client?.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium">{booking.client?.name}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-medium mb-2">Prestataire</p>
              {booking.provider ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {booking.provider.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{booking.provider.name}</span>
                </div>
              ) : (
                <p className="text-sm text-amber-600 font-medium">En attente d&apos;attribution</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info paiement */}
      {booking.payment && (
        <div className="bg-surface rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={20} /> Paiement
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted mb-1">Montant</p><p className="font-semibold">{Number(booking.payment.amount).toLocaleString()} FCFA</p></div>
            <div><p className="text-muted mb-1">Méthode</p><p className="font-semibold capitalize">{booking.payment.method?.replace('_', ' ')}</p></div>
            <div><p className="text-muted mb-1">Statut</p><p className="font-semibold capitalize">{booking.payment.status}</p></div>
            <div><p className="text-muted mb-1">Escrow</p>
              <p className={`font-semibold ${booking.payment.escrow_status === 'released' ? 'text-secondary' : 'text-amber-600'}`}>
                {booking.payment.escrow_status === 'held' ? 'Retenu' : booking.payment.escrow_status === 'released' ? 'Libéré' : 'Remboursé'}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Réf: {booking.payment.transaction_ref}</p>
        </div>
      )}

      {/* Admin : attribution sur cette page (même logique que l’onglet Admin) */}
      {isAdminRole && booking.status === 'en_attente_admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <UserPlus size={20} /> Attribuer un prestataire
          </h2>
          <p className="text-sm text-amber-800/90">
            Choisissez un prestataire vérifié dans la même catégorie que le service demandé. La demande passera ensuite en « attente prestataire » pour acceptation ou refus.
          </p>
          {providersLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : suggestedProviders.length === 0 ? (
            <p className="text-sm text-muted">Aucun prestataire éligible (profil actif + service dans cette catégorie). Ajoutez des services ou activez les comptes dans l&apos;administration.</p>
          ) : (
            <ul className="space-y-2">
              {suggestedProviders.map((p) => (
                <li key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-amber-100 rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-muted">{p.phone} · {p.missions_terminees} mission(s) · note {typeof p.rating === 'number' ? p.rating : Number(p.rating) || '—'}</p>
                  </div>
                  <button type="button" onClick={() => handleAssignFromDetail(p.id)} disabled={!!actionLoading}
                    className="shrink-0 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                    {actionLoading === `assign-${p.id}` ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><CheckCircle size={16} /> Attribuer</>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-surface rounded-2xl border border-gray-100 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Actions</h2>

        {/* Client: en attente admin → peut annuler */}
        {isClient && booking.status === 'en_attente_admin' && (
          <>
            <p className="text-sm text-muted bg-amber-50 p-3 rounded-lg">⏳ Votre demande est en cours d&apos;analyse par l&apos;administrateur.</p>
            <button onClick={() => handleStatusChange('annulee')} disabled={!!actionLoading}
              className="w-full flex items-center justify-center gap-2 border-2 border-danger text-danger hover:bg-red-50 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {actionLoading === 'annulee' ? <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" /> : <><XCircle size={16} /> Annuler la demande</>}
            </button>
          </>
        )}

        {/* Client: en attente prestataire */}
        {isClient && booking.status === 'en_attente_prestataire' && (
          <p className="text-sm text-muted bg-orange-50 p-3 rounded-lg">⏳ Un prestataire a été attribué. En attente de sa confirmation.</p>
        )}

        {/* Prestataire: en attente prestataire → accepter ou refuser */}
        {isProvider && booking.status === 'en_attente_prestataire' && (
          <div className="flex gap-3">
            <button onClick={() => handleStatusChange('acceptee')} disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {actionLoading === 'acceptee' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={16} /> Accepter</>}
            </button>
            <button onClick={() => handleStatusChange('refusee')} disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-danger hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {actionLoading === 'refusee' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><XCircle size={16} /> Refuser</>}
            </button>
          </div>
        )}

        {/* Client: acceptée → payer */}
        {isClient && booking.status === 'acceptee' && !booking.payment && (
          <>
            {!showPayment ? (
              <button onClick={() => setShowPayment(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors">
                <CreditCard size={18} /> Payer {Number(booking.total_price).toLocaleString()} FCFA
              </button>
            ) : (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900">Choisissez votre moyen de paiement</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(({ value, label, icon }) => (
                    <label key={value}
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === value ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="method" value={value} checked={paymentMethod === value}
                        onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPayment(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-muted">Annuler</button>
                  <button onClick={handlePayment} disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    {actionLoading === 'payment' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirmer le paiement'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Prestataire: acceptée, en attente du paiement client */}
        {isProvider && booking.status === 'acceptee' && !booking.payment && (
          <p className="text-sm text-muted bg-amber-50 p-3 rounded-lg">⏳ En attente du paiement du client.</p>
        )}

        {/* Prestataire: payée ou en_cours → marquer en cours ou terminée */}
        {isProvider && (booking.status === 'payee' || booking.status === 'en_cours') && (
          <button onClick={() => handleStatusChange(booking.status === 'payee' ? 'en_cours' : 'terminee')} disabled={!!actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={16} /> {booking.status === 'payee' ? 'Démarrer le service' : 'Marquer comme terminée'}</>}
          </button>
        )}

        {/* Client: terminée → libérer le paiement */}
        {isClient && booking.status === 'terminee' && booking.payment?.escrow_status === 'held' && (
          <button onClick={handleRelease} disabled={!!actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
            {actionLoading === 'release' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={18} /> Confirmer et libérer le paiement</>}
          </button>
        )}

        {booking.status === 'terminee' && booking.payment?.escrow_status === 'released' && (
          <p className="text-sm text-secondary bg-green-50 p-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} /> Mission terminée et paiement libéré.
          </p>
        )}

        {/* Évaluation existante */}
        {booking.rating && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Évaluation</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} className={s <= booking.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
              ))}
              <span className="text-sm font-bold text-gray-700 ml-2">{booking.rating}/5</span>
            </div>
            {booking.review && <p className="text-sm text-gray-600 italic">&laquo; {booking.review} &raquo;</p>}
          </div>
        )}

        {/* Client: noter le prestataire après paiement libéré */}
        {isClient && booking.status === 'terminee' && booking.payment?.escrow_status === 'released' && !booking.rating && (
          <>
            {!showRating ? (
              <button onClick={() => setShowRating(true)}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Star size={16} /> Évaluer le prestataire
              </button>
            ) : (
              <div className="space-y-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">Notez le prestataire</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRatingValue(s)}
                      className="transition-transform hover:scale-110">
                      <Star size={32} className={s <= ratingValue ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'} />
                    </button>
                  ))}
                  {ratingValue > 0 && <span className="text-sm font-bold text-gray-700 ml-2">{ratingValue}/5</span>}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Laissez un commentaire (optionnel)..." rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => setShowRating(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-muted">Annuler</button>
                  <button onClick={handleRate} disabled={ratingValue < 1 || !!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    {actionLoading === 'rate' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Envoyer l\'évaluation'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {booking.status === 'annulee' && (
          <p className="text-sm text-danger bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <XCircle size={16} /> Cette demande a été annulée.
          </p>
        )}

        {booking.status === 'refusee' && (
          <p className="text-sm text-danger bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <XCircle size={16} /> Le prestataire a refusé cette demande. L&apos;administrateur cherchera un autre prestataire.
          </p>
        )}
      </div>
    </div>
  );
}
