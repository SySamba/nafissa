import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoryAPI } from '../api/services';
import { categoryVisual } from '../lib/categoryImages';
import AuthShell from '../components/AuthShell';
import { UserPlus, Mail, Lock, Eye, EyeOff, Phone, User, MapPin, Upload, Camera, Calendar, Check, ArrowRight, IdCard, AlertCircle, ShieldAlert } from 'lucide-react';

const ROLES = [
  {
    value: 'maman',
    label: 'Client',
    desc: 'Je cherche des prestataires pour mes besoins au quotidien.',
    icon: '🏠',
  },
  {
    value: 'artisan',
    label: 'Prestataire',
    desc: 'Je propose mes services (vérification et pièce d\'identité requises).',
    icon: '🛠️',
  },
];

const SECTION_TITLES = {
  account: 'Informations du compte',
  personal: 'Détails personnels',
  services: 'Vos services',
  verification: 'Vérification d\'identité',
  security: 'Sécurité',
};

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="mb-4 mt-8 flex items-center gap-3 first:mt-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-sm shadow-primary/25">
        <Icon size={15} />
      </span>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-gray-800">{children}</h3>
      <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

const FIELD_BASE =
  'w-full rounded-2xl border bg-gray-50/70 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12';

// Indicatifs téléphoniques — Afrique de l'Ouest/Centrale, Maghreb, diaspora.
const DIAL_CODES = [
  ['+221', '🇸🇳 Sénégal'],
  ['+223', '🇲🇱 Mali'],
  ['+224', '🇬🇳 Guinée'],
  ['+225', "🇨🇮 Côte d'Ivoire"],
  ['+226', '🇧🇫 Burkina Faso'],
  ['+227', '🇳🇪 Niger'],
  ['+228', '🇹🇬 Togo'],
  ['+229', '🇧🇯 Bénin'],
  ['+232', '🇸🇱 Sierra Leone'],
  ['+233', '🇬🇭 Ghana'],
  ['+234', '🇳🇬 Nigéria'],
  ['+235', '🇹🇩 Tchad'],
  ['+236', '🇨🇫 Centrafrique'],
  ['+237', '🇨🇲 Cameroun'],
  ['+238', '🇨🇻 Cap-Vert'],
  ['+240', '🇬🇶 Guinée équat.'],
  ['+241', '🇬🇦 Gabon'],
  ['+242', '🇨🇬 Congo'],
  ['+243', '🇨🇩 RD Congo'],
  ['+245', '🇬🇼 Guinée-Bissau'],
  ['+220', '🇬🇲 Gambie'],
  ['+222', '🇲🇷 Mauritanie'],
  ['+212', '🇲🇦 Maroc'],
  ['+213', '🇩🇿 Algérie'],
  ['+216', '🇹🇳 Tunisie'],
  ['+218', '🇱🇾 Libye'],
  ['+33', '🇫🇷 France'],
  ['+1', '🇺🇸 USA/Canada'],
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: searchParams.get('name') || '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: searchParams.get('phone') || '',
    address: '',
    role: 'maman',
    gender: '',
    date_of_birth: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idCardRecto, setIdCardRecto] = useState(null);
  const [idCardVerso, setIdCardVerso] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dialCode, setDialCode] = useState('+221');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const isPrestataire = form.role === 'artisan';

  useEffect(() => {
    categoryAPI
      .list()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const toggleCategory = (id) => {
    const key = String(id);
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value && key !== 'phone') formData.append(key, value);
      });
      const localDigits = form.phone.replace(/\D/g, '');
      if (localDigits) formData.append('phone', `${dialCode}${localDigits}`);
      if (isPrestataire && selectedCategories.length) {
        formData.append('category_ids', JSON.stringify(selectedCategories));
      }
      if (photo) formData.append('photo', photo);
      if (idCardRecto) formData.append('id_card_recto', idCardRecto);
      if (idCardVerso) formData.append('id_card_verso', idCardVerso);
      const data = await register(formData);
      if (data.token) {
        navigate('/dashboard');
      } else {
        // Prestataire : compte créé mais en attente de validation admin.
        setPendingApproval(true);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: [err.response?.data?.message || "Erreur lors de l'inscription."] });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `${FIELD_BASE} pl-12 pr-4 ${
      errors[field] ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-primary'
    }`;

  const fieldError = (field) =>
    errors[field] ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
        <AlertCircle size={12} className="shrink-0" />
        {errors[field][0]}
      </p>
    ) : null;

  if (pendingApproval) {
    return (
      <AuthShell
        title="Compte en attente de validation"
        subtitle="Votre inscription prestataire a bien été enregistrée."
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <ShieldAlert size={30} />
          </span>
          <p className="max-w-md text-sm leading-relaxed text-gray-600">
            Un administrateur doit d'abord valider votre compte prestataire avant que vous puissiez
            vous connecter et proposer vos services. Vous serez notifié dès l'approbation.
          </p>
          <Link
            to="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
          >
            Aller à la connexion <ArrowRight size={16} />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title="Créer un compte"
      subtitle="Rejoignez NAFISSA — inscription gratuite. Les prestataires passent par une validation avant publication."
    >
      {errors.general && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-danger"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="leading-relaxed">{errors.general[0]}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Rôle ── */}
        <SectionTitle icon={User}>Je suis…</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map(({ value, label, desc, icon }) => {
            const active = form.role === value;
            return (
              <label
                key={value}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 p-4 transition-all ${
                  active
                    ? 'border-primary bg-primary/[0.06] shadow-sm shadow-primary/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={active}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${
                      active ? 'bg-primary/12' : 'bg-gray-100'
                    }`}
                    aria-hidden
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-bold ${active ? 'text-primary' : 'text-gray-900'}`}
                      >
                        {label}
                      </p>
                      {active && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* ── Photo de profil ── */}
        <SectionTitle icon={Camera}>Photo de profil</SectionTitle>
        <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
          <label className="group relative shrink-0 cursor-pointer">
            <div
              className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                photoPreview
                  ? 'border-primary/50'
                  : 'border-gray-300 bg-white group-hover:border-primary group-hover:bg-primary/5'
              }`}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu de la photo" className="h-full w-full object-cover" />
              ) : (
                <Camera
                  size={24}
                  className="text-gray-400 transition-colors group-hover:text-primary"
                />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-white">
              <Upload size={12} />
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0] || null;
                setPhoto(file);
                setPhotoPreview(file ? URL.createObjectURL(file) : null);
                setErrors((prev) => ({ ...prev, photo: undefined }));
              }}
            />
          </label>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800">
              {photo ? 'Photo sélectionnée' : 'Ajouter une photo'}
              <span className="ml-1.5 font-medium text-gray-400">(optionnel)</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Un visage rassure les familles. JPG, PNG ou WebP — 3 Mo max.
            </p>
            {fieldError('photo')}
          </div>
        </div>

        {/* ── Informations du compte ── */}
        <SectionTitle icon={Mail}>{SECTION_TITLES.account}</SectionTitle>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-[13px] font-bold text-gray-700">Nom complet</label>
            <div className="group relative">
              <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
              <input id="name" name="name" type="text" required autoComplete="name" value={form.name} onChange={handleChange}
                placeholder="Votre nom complet" className={inputClass('name')} />
            </div>
            {fieldError('name')}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-bold text-gray-700">Email</label>
              <div className="group relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
                <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange}
                  placeholder="votre@email.com" className={inputClass('email')} />
              </div>
              {fieldError('email')}
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-[13px] font-bold text-gray-700">Téléphone</label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label="Indicatif du pays"
                  className="w-[8.5rem] shrink-0 rounded-2xl border border-gray-200 bg-gray-50/70 py-3.5 pl-3 pr-1 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12"
                >
                  {DIAL_CODES.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                <div className="group relative flex-1">
                  <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
                  <input id="phone" name="phone" type="tel" autoComplete="tel-national" value={form.phone} onChange={handleChange}
                    placeholder="7X XXX XX XX" className={inputClass('phone')} />
                </div>
              </div>
              {fieldError('phone')}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-[13px] font-bold text-gray-700">Adresse</label>
            <div className="group relative">
              <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
              <input id="address" name="address" type="text" autoComplete="street-address" value={form.address} onChange={handleChange}
                placeholder="Ex: Mermoz, Dakar" className={inputClass('address')} />
            </div>
            {fieldError('address')}
          </div>
        </div>

        {/* ── Détails personnels (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={Calendar}>{SECTION_TITLES.personal}</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gender" className="mb-2 block text-[13px] font-bold text-gray-700">Genre</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`${FIELD_BASE} border-gray-200 px-4 focus:border-primary`}>
                  <option value="">Sélectionner</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label htmlFor="date_of_birth" className="mb-2 block text-[13px] font-bold text-gray-700">Date de naissance</label>
                <div className="group relative">
                  <Calendar size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className={inputClass('date_of_birth')}
                  />
                </div>
                {fieldError('date_of_birth')}
              </div>
            </div>
          </>
        )}

        {/* ── Services proposés (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={Check}>{SECTION_TITLES.services}</SectionTitle>
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              Sélectionnez une ou plusieurs catégories. Vous fixerez les prix après la validation de votre compte.
            </p>
            {categories.length === 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {categories.map((cat) => {
                  const active = selectedCategories.includes(String(cat.id));
                  const { emoji } = categoryVisual(cat);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      aria-pressed={active}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all ${
                        active
                          ? 'border-secondary bg-secondary/10 text-secondary-dark'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/60'
                      }`}
                    >
                      <span className="text-lg leading-none" aria-hidden>{emoji}</span>
                      <span className="truncate">{cat.name}</span>
                      {active && (
                        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedCategories.length > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary-dark">
                <Check size={12} strokeWidth={3} />
                {selectedCategories.length} service{selectedCategories.length > 1 ? 's' : ''} sélectionné{selectedCategories.length > 1 ? 's' : ''}
              </p>
            )}
          </>
        )}

        {/* ── Pièce d'identité (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={IdCard}>{SECTION_TITLES.verification}</SectionTitle>
            <div className="rounded-2xl border border-secondary/30 bg-secondary/[0.07] p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-dark">
                  <ShieldAlert size={16} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">Pièce d&apos;identité obligatoire</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Elle sert uniquement à valider votre profil. JPG, PNG ou PDF — 5 Mo max par fichier.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { key: 'id_card_recto', label: 'Recto', file: idCardRecto, setFile: setIdCardRecto },
                  { key: 'id_card_verso', label: 'Verso', file: idCardVerso, setFile: setIdCardVerso },
                ].map(({ key, label, file, setFile }) => (
                  <div key={key}>
                    <p className="mb-1.5 text-xs font-bold text-gray-600">{label}</p>
                    <label
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 text-sm transition-all ${
                        file
                          ? 'border-primary/50 bg-primary/[0.06] font-semibold text-primary'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {file ? <Check size={16} strokeWidth={3} /> : <Upload size={16} />}
                      <span className="truncate">{file ? file.name : 'Choisir un fichier'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          setFile(e.target.files[0] || null);
                          setErrors((prev) => ({ ...prev, [key]: undefined }));
                        }}
                      />
                    </label>
                    {fieldError(key)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Sécurité ── */}
        <SectionTitle icon={Lock}>{SECTION_TITLES.security}</SectionTitle>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor="password" className="text-[13px] font-bold text-gray-700">Mot de passe</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <div className="group relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                autoComplete="new-password"
                value={form.password} onChange={handleChange} placeholder="Min. 8 caractères"
                className={inputClass('password')} />
            </div>
            {fieldError('password')}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="mb-2 block text-[13px] font-bold text-gray-700">Confirmer le mot de passe</label>
            <div className="group relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
              <input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'}
                required autoComplete="new-password" value={form.password_confirmation} onChange={handleChange} placeholder="Retapez le mot de passe"
                className={inputClass('password_confirmation')} />
            </div>
            {fieldError('password_confirmation')}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-secondary to-secondary-dark py-4 text-sm font-bold text-white shadow-lg shadow-secondary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-secondary/35 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Création du compte…
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Créer mon compte
              <ArrowRight size={16} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
          En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de
          confidentialité.
        </p>
      </form>

      <div className="mt-7 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-bold text-primary transition-colors hover:text-primary-dark">Se connecter</Link>
      </div>
    </AuthShell>
  );
}
