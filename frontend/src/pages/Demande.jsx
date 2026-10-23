import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, FileText, User, Phone, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, categoryAPI } from '../api/services';
import BrandMark from '../components/BrandMark';

export default function Demande() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: '',
    booking_date: '',
    booking_time: '',
    duration: '',
    location: '',
    description: '',
    guest_name: '',
    guest_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null); // { bookingId, trackingToken }

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        category_id: form.category_id,
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        duration: form.duration || null,
        location: form.location || null,
        description: form.description || null,
        guest_name: user ? undefined : form.guest_name,
        guest_phone: user ? undefined : form.guest_phone,
      });
      setSent({
        bookingId: data.booking?.id,
        trackingToken: data.tracking_token || data.booking?.tracking_token,
        message: data.message,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'envoyer la demande. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Demande envoyée !</h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            {sent.message || "Notre équipe examine votre demande et vous attribue le prestataire vérifié le plus adapté. Vous serez notifié par WhatsApp."}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            {sent.trackingToken && (
              <Link
                to={`/suivi/${sent.trackingToken}`}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
                Suivre ma demande n°{String(sent.bookingId)}
              </Link>
            )}
            {user ? (
              <Link to="/bookings" className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                Voir mes demandes
              </Link>
            ) : (
              <Link to="/register" className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                Créer un compte pour suivre en ligne
              </Link>
            )}
            <Link to="/" className="text-sm text-muted hover:text-primary transition-colors">← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" aria-label="NAFISSA — retour à l'accueil"><BrandMark height="h-10 sm:h-12" /></Link>
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Décrivez votre besoin</h1>
            <p className="mt-3 text-muted leading-relaxed">
              Remplissez le formulaire : notre équipe vérifie votre demande et vous attribue
              le prestataire vérifié le plus adapté. Vous n&apos;avez rien d&apos;autre à choisir.
            </p>
          </div>

          <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-danger text-sm rounded-xl">{error}</div>
            )}

            <div>
              <label htmlFor="category_id" className="block text-sm font-semibold text-gray-800 mb-1.5">Type de service *</label>
              <select
                id="category_id"
                required
                value={form.category_id}
                onChange={set('category_id')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Choisissez la catégorie…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking_date" className="block text-sm font-semibold text-gray-800 mb-1.5">Date souhaitée *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="booking_date" type="date" required
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.booking_date} onChange={set('booking_date')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="booking_time" className="block text-sm font-semibold text-gray-800 mb-1.5">Heure souhaitée *</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="booking_time" type="time" required
                    value={form.booking_time} onChange={set('booking_time')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-800 mb-1.5">Durée estimée *</label>
              <select
                id="duration" required
                value={form.duration} onChange={set('duration')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Combien de temps environ…</option>
                <option value="1 heure">1 heure</option>
                <option value="2 heures">2 heures</option>
                <option value="3 heures">3 heures</option>
                <option value="Demi-journée (4 h)">Demi-journée (4 h)</option>
                <option value="Journée complète (8 h)">Journée complète (8 h)</option>
                <option value="Plusieurs jours">Plusieurs jours</option>
                <option value="À définir avec l'équipe">À définir avec l'équipe</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-1.5">Lieu d'intervention (quartier, adresse) *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="location" type="text" required maxLength={255}
                  value={form.location} onChange={set('location')}
                  placeholder="Ex: Mermoz, Sacré-Cœur 3, Niary Tally…"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1.5">Décrivez votre besoin</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3.5 text-muted" />
                <textarea
                  id="description" rows={4} maxLength={2000}
                  value={form.description} onChange={set('description')}
                  placeholder="Ex: ménage complet d'un appartement F3, repassage inclus, apporter les produits…"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                />
              </div>
              <p className="mt-1 text-xs text-muted">Plus vous êtes précise, mieux notre équipe choisit le prestataire.</p>
            </div>

            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div>
                  <label htmlFor="guest_name" className="block text-sm font-semibold text-gray-800 mb-1.5">Votre nom complet *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="guest_name" type="text" required minLength={2} maxLength={100}
                      value={form.guest_name} onChange={set('guest_name')}
                      placeholder="Ex: Awa Ndiaye"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="guest_phone" className="block text-sm font-semibold text-gray-800 mb-1.5">Votre téléphone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="guest_phone" type="tel" required maxLength={30}
                      value={form.guest_phone} onChange={set('guest_phone')}
                      placeholder="77 000 00 00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed">
              <Send size={17} /> {loading ? 'Envoi…' : 'Envoyer ma demande'}
            </button>
            <p className="text-center text-xs text-muted">
              Sans engagement — notre équipe vous recontacte avant toute confirmation.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
