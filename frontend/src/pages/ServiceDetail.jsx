import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceAPI, bookingAPI } from '../api/services';
import { MapPin, Star, Calendar, Clock, ArrowLeft, Check, Edit, Trash2, FileText } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMaman } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '', booking_time: '', notes: '', location: '', description: '',
  });
  const [showBooking, setShowBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    serviceAPI.show(id)
      .then(({ data }) => setService(data.service))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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
      setSuccess('Demande envoyée ! L\'administrateur va attribuer un prestataire.');
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
          <Check size={18} /> {success}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {service.category?.name}
            </span>
            <span className="text-2xl font-bold text-secondary">{Number(service.price).toLocaleString()} FCFA</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h1>
          <p className="text-muted leading-relaxed">{service.description}</p>

          {service.location && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted">
              <MapPin size={16} /> {service.location}
            </div>
          )}

          {/* Info prestataire */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Prestataire</h3>
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
          </div>

          {/* Boutons propriétaire */}
          {isOwner && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
              <Link to={`/services/${id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                <Edit size={16} /> Modifier
              </Link>
              <button onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-danger rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section demande de service (maman uniquement) */}
      {isMaman && !isOwner && (
        <div className="bg-surface rounded-2xl border border-gray-100 p-6 sm:p-8">
          {!showBooking ? (
            <button onClick={() => setShowBooking(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors">
              <Calendar size={18} /> Faire une demande pour ce service
            </button>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faire une demande</h3>
              <p className="text-sm text-muted mb-4">L&apos;administrateur va analyser votre demande et attribuer le meilleur prestataire disponible.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">{error}</div>
              )}
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input id="booking_date" type="date" required min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.booking_date}
                        onChange={(e) => setBookingForm((p) => ({ ...p, booking_date: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-1">Heure souhaitée</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input id="booking_time" type="time" required value={bookingForm.booking_time}
                        onChange={(e) => setBookingForm((p) => ({ ...p, booking_time: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Localisation (adresse d&apos;intervention)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input id="location" type="text" value={bookingForm.location}
                      onChange={(e) => setBookingForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ex: Mermoz, Dakar"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description de votre besoin</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-muted" />
                    <textarea id="description" rows={3} value={bookingForm.description}
                      onChange={(e) => setBookingForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Décrivez précisément ce dont vous avez besoin..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes supplémentaires (optionnel)</label>
                  <textarea id="notes" rows={2} value={bookingForm.notes}
                    onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Informations complémentaires..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowBooking(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-muted hover:border-gray-300 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting}
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
