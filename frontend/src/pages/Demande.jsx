import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, FileText, User, Phone, ArrowLeft, CheckCircle2, Send,
  LocateFixed, Search, Check, ExternalLink, Flag, Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, categoryAPI, geoAPI } from '../api/services';
import BrandMark from '../components/BrandMark';
import MapPicker from '../components/MapPicker';
import { categoryVisual } from '../lib/categoryImages';
import { groupCategories } from '../lib/serviceGroups';

const DURATIONS = [
  '1 heure',
  '2 heures',
  '3 heures',
  'Demi-journée (4 h)',
  'Journée complète (8 h)',
  'Plusieurs jours',
  "À définir avec l'équipe",
];

const inputCls =
  'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

function Section({ num, title, hint, children }) {
  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/40 p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-extrabold text-white">
          {num}
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const POSITION_LABELS = {
  gps: 'Position GPS',
  search: 'Adresse localisée',
};

const GEO_ERRORS = {
  1: "Accès à la position refusé. Autorisez la localisation dans votre navigateur, ou saisissez l'adresse.",
  2: 'Position indisponible pour le moment. Saisissez votre adresse.',
  3: 'La localisation a pris trop de temps. Réessayez ou saisissez votre adresse.',
};

export default function Demande() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: searchParams.get('categorie') || '',
    booking_date: '',
    booking_time: '',
    duration: '',
    location: user?.address || '',
    landmark: '',
    description: '',
    guest_name: '',
    guest_phone: '',
  });
  // Position de l'intervention : { lat, lng, source: 'gps' | 'search', accuracy? }
  const [position, setPosition] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | searching
  const [geoError, setGeoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const groups = useMemo(() => groupCategories(categories), [categories]);
  const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const locateMe = () => {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError("Votre navigateur ne permet pas la localisation. Saisissez l'adresse.");
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude, accuracy: Math.round(coords.accuracy), source: 'gps' };
        setPosition(pos);
        try {
          const { data } = await geoAPI.reverse(pos.lat, pos.lng);
          if (data.label) setForm((p) => ({ ...p, location: data.label }));
        } catch {
          // Adresse non résolue : la position GPS reste enregistrée.
        }
        setGeoStatus('idle');
      },
      (err) => {
        setGeoError(GEO_ERRORS[err.code] || GEO_ERRORS[2]);
        setGeoStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const locateAddress = async () => {
    const q = form.location.trim();
    if (q.length < 2) return;
    setGeoError('');
    setGeoStatus('searching');
    try {
      const { data } = await geoAPI.search(q);
      setPosition({ lat: data.lat, lng: data.lng, source: 'search' });
    } catch {
      setPosition(null);
      setGeoError("Adresse introuvable. Touchez directement votre position sur la carte.");
    } finally {
      setGeoStatus('idle');
    }
  };

  const onLocationChange = (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, location: value }));
    // Une position issue de la recherche ne correspond plus au texte modifié ;
    // une position GPS reste valable (on affine seulement le libellé).
    if (position && position.source === 'search') setPosition(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category_id) {
      setError('Choisissez le type de service.');
      return;
    }
    if (!form.duration) {
      setError('Indiquez la durée estimée.');
      return;
    }
    setLoading(true);
    const landmark = form.landmark.trim();
    const location = (landmark ? `${form.location.trim()} (Repère : ${landmark})` : form.location.trim()).slice(0, 255);
    try {
      const { data } = await bookingAPI.create({
        category_id: form.category_id,
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        duration: form.duration,
        location: location || null,
        description: form.description || null,
        lat: position?.lat ?? null,
        lng: position?.lng ?? null,
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

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Demande en 2 minutes
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Décrivez votre besoin</h1>
            <p className="mt-3 text-muted leading-relaxed max-w-xl mx-auto">
              Notre équipe vérifie votre demande et vous attribue le prestataire vérifié le plus adapté,
              proche de chez vous. Vous n&apos;avez rien d&apos;autre à choisir.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* 1 — Service */}
            <Section num="1" title="Quel service ?" hint="Choisissez le type de service dont vous avez besoin.">
              {categories.length === 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  {groups.map((g) => (
                    <div key={g.key}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{g.label}</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {g.categories.map((cat) => {
                          const active = String(cat.id) === String(form.category_id);
                          const { image, gradient } = categoryVisual(cat);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setForm((p) => ({ ...p, category_id: String(cat.id) }))}
                              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-2.5 text-left transition-all ${
                                active
                                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                              }`}
                            >
                              <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${gradient}`}>
                                {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                              </span>
                              <span className={`text-sm font-bold leading-tight ${active ? 'text-primary' : 'text-gray-800'}`}>
                                {cat.name}
                              </span>
                              {active && (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Précisez votre besoin
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3.5 text-muted" />
                  <textarea
                    id="description" rows={3} maxLength={2000}
                    value={form.description} onChange={set('description')}
                    placeholder={selectedCategory
                      ? `Ex : détails utiles pour « ${selectedCategory.name} » (surface, nombre d'enfants, matériel…)`
                      : "Ex : ménage complet d'un appartement F3, repassage inclus…"}
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">Plus vous êtes précise, mieux notre équipe choisit le prestataire.</p>
              </div>
            </Section>

            {/* 2 — Quand */}
            <Section num="2" title="Quand ?" hint="Date, heure et durée approximative de l'intervention.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking_date" className="block text-sm font-semibold text-gray-800 mb-1.5">Date souhaitée *</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="booking_date" type="date" required
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.booking_date} onChange={set('booking_date')}
                      className={inputCls}
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
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-5 mb-2 text-sm font-semibold text-gray-800">Durée estimée *</p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => {
                  const active = form.duration === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setForm((p) => ({ ...p, duration: d }))}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 3 — Où */}
            <Section num="3" title="Où ?" hint="Le lieu exact nous permet de choisir un prestataire proche de chez vous.">
              <div className={`grid grid-cols-1 gap-5 ${position ? 'lg:grid-cols-2' : ''}`}>
                <div>
                  <button
                    type="button"
                    onClick={locateMe}
                    disabled={geoStatus === 'locating'}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/10 disabled:opacity-60"
                  >
                    {geoStatus === 'locating'
                      ? <><Loader2 size={18} className="animate-spin" /> Localisation en cours…</>
                      : <><LocateFixed size={18} /> Je suis sur le lieu : utiliser ma position</>}
                  </button>

                  <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <span className="h-px flex-1 bg-gray-200" /> ou saisissez l&apos;adresse <span className="h-px flex-1 bg-gray-200" />
                  </div>

                  <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Lieu d&apos;intervention (quartier, adresse) *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="location" type="text" required maxLength={200}
                        value={form.location} onChange={onLocationChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); locateAddress(); } }}
                        placeholder="Ex : Mermoz, Sacré-Cœur 3, Niary Tally…"
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={locateAddress}
                      disabled={geoStatus === 'searching' || form.location.trim().length < 2}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary disabled:opacity-50"
                      aria-label="Localiser l'adresse sur la carte"
                    >
                      {geoStatus === 'searching' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      <span className="hidden sm:inline">Localiser</span>
                    </button>
                  </div>

                  {geoError && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{geoError}</p>
                  )}

                  <div className="mt-4">
                    <label htmlFor="landmark" className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Point de repère <span className="font-normal text-muted">(conseillé)</span>
                    </label>
                    <div className="relative">
                      <Flag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="landmark" type="text" maxLength={80}
                        value={form.landmark} onChange={set('landmark')}
                        placeholder="Ex : près de la mosquée, portail bleu, 2e étage…"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {position && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="relative h-64 w-full lg:h-full lg:min-h-[22rem]">
                      <MapPicker position={position} className="absolute inset-0" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 py-2.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {POSITION_LABELS[position.source] || 'Position enregistrée'}
                        {position.source === 'gps' && position.accuracy ? ` (± ${position.accuracy} m)` : ''}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${position.lat},${position.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Vérifier sur Google Maps <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* 4 — Coordonnées (invitées) */}
            {!user && (
              <Section num="4" title="Vos coordonnées" hint="Pour vous confirmer la demande sur WhatsApp — sans créer de compte.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guest_name" className="block text-sm font-semibold text-gray-800 mb-1.5">Votre nom complet *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="guest_name" type="text" required minLength={2} maxLength={100}
                        value={form.guest_name} onChange={set('guest_name')}
                        placeholder="Ex : Awa Ndiaye"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="guest_phone" className="block text-sm font-semibold text-gray-800 mb-1.5">Votre téléphone (WhatsApp) *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="guest_phone" type="tel" required maxLength={30}
                        value={form.guest_phone} onChange={set('guest_phone')}
                        placeholder="77 000 00 00"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {error && (
              <div role="alert" className="p-3.5 bg-red-50 border border-red-200 text-danger text-sm rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-base transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={18} /> {loading ? 'Envoi…' : 'Envoyer ma demande'}
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
