import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceAPI, bookingAPI } from '../api/services';
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { categoryVisual } from '../lib/categoryImages';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMaman } = useAuth();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    booking_time: '',
    notes: '',
    location: '',
    description: '',
  });
  const [showBooking, setShowBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    serviceAPI
      .show(id)
      .then(({ data }) => setService(data.service))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!service) return;
    serviceAPI
      .categoryProviders(id)
      .then(({ data }) => setProviders(Array.isArray(data.providers) ? data.providers : []))
      .catch(() => setProviders([]));
  }, [id, service]);

  useEffect(() => {
    if (user?.address) {
      setBookingForm((p) => ({ ...p, location: user.address }));
    }
  }, [user]);

  useEffect(() => {
    if (!showBooking) return;
    const today = new Date().toISOString().split('T')[0];
    setBookingForm((p) => ({
      ...p,
      booking_date: p.booking_date || today,
      booking_time: p.booking_time || '09:00',
    }));
  }, [showBooking]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await bookingAPI.create({ service_id: Number(id), ...bookingForm });
      setSuccess("Demande envoyée ! L'administrateur va attribuer un prestataire.");
      setShowBooking(false);
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce service ?')) return;
    try {
      await serviceAPI.remove(id);
      navigate('/services');
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) return null;

  const isOwner = String(service.provider_id) === String(user?.id);
  const cover = categoryVisual(service.category || {});
  const listingOk =
    service.available !== false &&
    service.provider?.verified === true &&
    service.provider?.profile?.status === 'active';
  /** Prestataires vérifiés dans la même catégorie (offre publiée) */
  const hasMarket = providers.length > 0;
  const uniqueProviderCount = new Set(providers.map((r) => r.provider?.id).filter(Boolean)).size;
  const canRequestBooking = Boolean(isMaman && !isOwner && listingOk && hasMarket);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
          <Check size={18} /> {success}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        <div className={`relative h-44 sm:h-56 bg-gradient-to-br ${cover.gradient}`}>
          <img src={cover.image} alt={service.category?.name || ''} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute bottom-4 left-4 text-sm font-medium bg-white/90 text-primary px-3 py-1 rounded-full backdrop-blur-sm">
            {service.category?.name}
          </span>
          <span className="absolute bottom-4 right-4 text-lg font-bold text-white drop-shadow">
            {Number(service.price).toLocaleString()} FCFA
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h1>
          <p className="text-muted leading-relaxed">{service.description}</p>

          {service.location && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted">
              <MapPin size={16} /> {service.location}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Prestataire référencé</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold">
                {service.provider?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{service.provider?.name}</p>
                {service.provider?.profile?.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-accent">
                    <Star size={14} fill="currentColor" /> {service.provider.profile.rating} / 5
                  </span>
                )}
                {service.provider?.profile?.bio && (
                  <p className="text-sm text-muted mt-1">{service.provider.profile.bio}</p>
                )}
              </div>
            </div>
            {!listingOk ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircle size={18} className="shrink-0 mt-0.5" /> Cette fiche ne peut pas être réservée
                (statut prestataire ou disponibilité).
              </p>
            ) : null}
          </div>

          {isOwner && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
              <Link
                to={`/services/${id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                <Edit size={16} /> Modifier
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-danger rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {isMaman && !isOwner && (
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-secondary/10 p-5 sm:p-6 shadow-sm">
          {!hasMarket ? (
            <>
              <h2 className="text-lg font-bold text-gray-900">Prestataires sur cette famille de services</h2>
              <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-white/85 p-4 text-sm text-amber-900">
                <AlertCircle size={20} className="shrink-0 text-accent" />
                Il n&apos;y a pour l&apos;instant aucun vivier disponible avec une offre active dans cette catégorie au Sénégal. Revenez plus tard ou parcourez une autre famille de besoins depuis l&apos;accueil ou le catalogue.
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-emerald-100/80 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/85">Famille · même besoin au Sénégal</p>
                  <p className="mt-2 text-4xl font-black tabular-nums text-gray-900 sm:text-5xl">{uniqueProviderCount}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    profil{uniqueProviderCount === 1 ? '' : 's'} vérifié{uniqueProviderCount === 1 ? '' : 's'} et distinct{uniqueProviderCount === 1 ? '' : 's'} pour couvrir votre besoin au Sénégal.
                  </p>
                  {providers.length > uniqueProviderCount ? (
                    <p className="mt-2 text-xs text-muted">
                      {providers.length} annonce{providers.length === 1 ? '' : 's'} distincte(s) encore visibles sur le vivier catalogue — le choix final reste traité par l&apos;équipe.
                    </p>
                  ) : null}
                </div>
                <span className="rounded-2xl bg-primary px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-900/15">
                  Vivier NAFISSA
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                Vous n&apos;avez rien à choisir ligne par ligne dans une liste&nbsp;: envoyez vos créneaux et votre lieu. Notre équipe rattache votre dossier au bon profil vérifié du vivier, avec le même niveau de suivi qu&apos;avec une agence sérieuse au Sénégal.
              </p>
            </>
          )}
        </div>
      )}

      {isMaman && !isOwner && (
        <div className="bg-surface rounded-2xl border border-gray-100 p-6 sm:p-8">
          {!showBooking ? (
            <div className="space-y-3">
              {!canRequestBooking ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {!listingOk ? (
                    <span>Cette fiche n&apos;est pas disponible pour une nouvelle réservation pour le moment.</span>
                  ) : (
                    <span>
                      Vous pouvez envoyer une demande lorsqu&apos;il y a au moins un prestataire vérifié dans ce vivier (voir le chiffre au-dessus).
                    </span>
                  )}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => canRequestBooking && setShowBooking(true)}
                disabled={!canRequestBooking}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${canRequestBooking
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
                  }`}>
                <Calendar size={18} /> Faire une demande pour cette offre
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre demande</h3>
              <p className="text-sm text-muted mb-4">
                L&apos;équipe reçoit vos informations et voit jusqu&apos;à <strong>{providers.length}</strong> annonce{providers.length === 1 ? '' : 's'} active(s) reliée(s) au vivier (~ <strong>{uniqueProviderCount}</strong> prestataire{uniqueProviderCount === 1 ? '' : 's'} différent(s) vérifié(s)).
                Attribution humaine puis validation par votre prestataire référé.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">{error}</div>
              )}
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="booking_date"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.booking_date}
                        onChange={(e) => setBookingForm((p) => ({ ...p, booking_date: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-1">Heure souhaitée</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="booking_time"
                        type="time"
                        required
                        value={bookingForm.booking_time}
                        onChange={(e) => setBookingForm((p) => ({ ...p, booking_time: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Localisation (adresse d&apos;intervention)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="location"
                      type="text"
                      value={bookingForm.location}
                      onChange={(e) => setBookingForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ex: Mermoz, Dakar"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description de votre besoin</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-muted" />
                    <textarea
                      id="description"
                      rows={3}
                      value={bookingForm.description}
                      onChange={(e) => setBookingForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Décrivez précisément ce dont vous avez besoin..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes supplémentaires (optionnel)</label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Informations complémentaires..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-muted hover:border-gray-300 transition-colors">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Envoyer ma demande'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
