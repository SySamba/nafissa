import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoryAPI } from '../api/services';
import { categoryVisual } from '../lib/categoryImages';
import AuthShell from '../components/AuthShell';
import { UserPlus, Mail, Lock, Eye, EyeOff, Phone, User, MapPin, Upload, Camera, Calendar, Check, ShieldCheck, ArrowRight, IdCard } from 'lucide-react';

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
    <div className="flex items-center gap-2.5 mb-4 mt-6 first:mt-0">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={15} />
      </span>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{children}</h3>
      <span className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', phone: '', address: '', role: 'maman',
    gender: '', date_of_birth: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idCardRecto, setIdCardRecto] = useState(null);
  const [idCardVerso, setIdCardVerso] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
      Object.entries(form).forEach(([key, value]) => { if (value) formData.append(key, value); });
      if (isPrestataire && selectedCategories.length) {
        formData.append('category_ids', JSON.stringify(selectedCategories));
      }
      if (photo) formData.append('photo', photo);
      if (idCardRecto) formData.append('id_card_recto', idCardRecto);
      if (idCardVerso) formData.append('id_card_verso', idCardVerso);
      await register(formData);
      navigate('/dashboard');
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
    `w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
      errors[field] ? 'border-danger' : 'border-gray-200'
    }`;

  return (
    <AuthShell
      wide
      title="Créer un compte"
      subtitle="Rejoignez NAFISSA — inscription gratuite. Les prestataires passent par une validation avant publication."
    >
      {errors.general && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-danger">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <span>{errors.general[0]}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-1">
        {/* ── Rôle ── */}
        <SectionTitle icon={User}>Je suis…</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          {ROLES.map(({ value, label, desc, icon }) => (
            <label
              key={value}
              className={`flex items-start gap-3.5 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                form.role === value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={form.role === value}
                onChange={handleChange}
                className="mt-0.5 accent-primary"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* ── Photo de profil ── */}
        <SectionTitle icon={Camera}>Photo de profil</SectionTitle>
        <div className="flex flex-col items-center mb-2">
          <label className="relative cursor-pointer group">
            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
              photoPreview ? 'border-green-400' : 'border-gray-300 hover:border-primary'
            }`}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} className="text-gray-400 group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
              <Upload size={12} />
            </div>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files[0] || null;
                setPhoto(file);
                setPhotoPreview(file ? URL.createObjectURL(file) : null);
                setErrors((prev) => ({ ...prev, photo: undefined }));
              }} />
          </label>
          <p className="text-xs text-gray-400 mt-2">JPG, PNG ou WebP — Max 3 Mo</p>
          {errors.photo && <p className="text-xs text-danger mt-1">{errors.photo[0]}</p>}
        </div>

        {/* ── Informations du compte ── */}
        <SectionTitle icon={Mail}>{SECTION_TITLES.account}</SectionTitle>
        <div className="space-y-4 mb-2">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">Nom complet</label>
            <div className="relative group">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
              <input id="name" name="name" type="text" required value={form.name} onChange={handleChange}
                placeholder="Votre nom complet" className={inputClass('name')} />
            </div>
            {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="votre@email.com" className={inputClass('email')} />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">Téléphone</label>
              <div className="relative group">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+221 7X XXX XX XX" className={inputClass('phone')} />
              </div>
              {errors.phone && <p className="text-xs text-danger mt-1.5">{errors.phone[0]}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">Adresse</label>
            <div className="relative group">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
              <input id="address" name="address" type="text" value={form.address} onChange={handleChange}
                placeholder="Ex: Mermoz, Dakar" className={inputClass('address')} />
            </div>
            {errors.address && <p className="text-xs text-danger mt-1.5">{errors.address[0]}</p>}
          </div>
        </div>

        {/* ── Détails personnels (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={Calendar}>{SECTION_TITLES.personal}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-800 mb-2">Genre</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Sélectionner</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-800 mb-2">Date de naissance</label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.date_of_birth && <p className="text-xs text-danger mt-1.5">{errors.date_of_birth[0]}</p>}
              </div>
            </div>
          </>
        )}

        {/* ── Services proposés (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={Check}>{SECTION_TITLES.services}</SectionTitle>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Sélectionnez une ou plusieurs catégories. Vous fixerez les prix après la validation de votre compte.
            </p>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400">Chargement des catégories…</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-2">
                {categories.map((cat) => {
                  const active = selectedCategories.includes(String(cat.id));
                  const { emoji } = categoryVisual(cat);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative flex items-center gap-2 rounded-xl border-2 px-3.5 py-3 text-left text-sm font-medium transition-all ${
                        active
                          ? 'border-secondary bg-secondary/10 text-secondary ring-1 ring-secondary/20'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <span className="text-lg leading-none" aria-hidden>{emoji}</span>
                      <span className="truncate">{cat.name}</span>
                      {active && (
                        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedCategories.length > 0 && (
              <p className="mt-2 text-xs font-bold text-secondary">
                {selectedCategories.length} service{selectedCategories.length > 1 ? 's' : ''} sélectionné{selectedCategories.length > 1 ? 's' : ''}
              </p>
            )}
          </>
        )}

        {/* ── Pièce d'identité (prestataires) ── */}
        {isPrestataire && (
          <>
            <SectionTitle icon={IdCard}>{SECTION_TITLES.verification}</SectionTitle>
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 mb-2">
              <p className="text-sm font-bold text-amber-800 mb-1">Pièce d&apos;identité obligatoire</p>
              <p className="text-xs text-amber-600 mb-3">Formats acceptés : JPG, PNG, PDF — Max 5 Mo par fichier</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recto</label>
                  <label className={`flex items-center gap-2.5 px-3.5 py-3 border-2 rounded-xl cursor-pointer transition-all text-sm ${
                    idCardRecto ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-primary hover:bg-primary/5'
                  }`}>
                    <Upload size={16} />
                    <span className="truncate">{idCardRecto ? idCardRecto.name : 'Choisir un fichier'}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={(e) => { setIdCardRecto(e.target.files[0] || null); setErrors((prev) => ({ ...prev, id_card_recto: undefined })); }} />
                  </label>
                  {errors.id_card_recto && <p className="text-xs text-danger mt-1.5">{errors.id_card_recto[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verso</label>
                  <label className={`flex items-center gap-2.5 px-3.5 py-3 border-2 rounded-xl cursor-pointer transition-all text-sm ${
                    idCardVerso ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-primary hover:bg-primary/5'
                  }`}>
                    <Upload size={16} />
                    <span className="truncate">{idCardVerso ? idCardVerso.name : 'Choisir un fichier'}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={(e) => { setIdCardVerso(e.target.files[0] || null); setErrors((prev) => ({ ...prev, id_card_verso: undefined })); }} />
                  </label>
                  {errors.id_card_verso && <p className="text-xs text-danger mt-1.5">{errors.id_card_verso[0]}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Sécurité ── */}
        <SectionTitle icon={Lock}>{SECTION_TITLES.security}</SectionTitle>
        <div className="space-y-4 mb-2">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">Mot de passe</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                value={form.password} onChange={handleChange} placeholder="Min. 8 caractères"
                className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.password ? 'border-danger' : 'border-gray-200'}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password[0]}</p>}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-800 mb-2">Confirmer le mot de passe</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
              <input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'}
                required value={form.password_confirmation} onChange={handleChange} placeholder="Retapez le mot de passe"
                className={inputClass('password_confirmation')} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus size={18} />
              Créer mon compte
              <ArrowRight size={16} className="opacity-70" />
            </>
          )}
        </button>
      </form>

      <p className="text-center mt-7 text-sm text-gray-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
