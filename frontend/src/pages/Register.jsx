import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { UserPlus, Mail, Lock, Eye, EyeOff, Phone, User, MapPin, Upload, Camera, Calendar } from 'lucide-react';

const ROLES = [
  { value: 'maman', label: 'Maman (Cliente)', desc: 'Je cherche des services à domicile' },
  { value: 'etudiant', label: 'Étudiant(e)', desc: 'Je propose mes services comme étudiant' },
  { value: 'artisan', label: 'Artisan(e)', desc: 'Je propose mes services comme artisan' },
];

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

  const isPrestataire = form.role === 'etudiant' || form.role === 'artisan';

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
    `w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all ${
      errors[field] ? 'border-danger' : 'border-gray-200/90'
    }`;

  return (
    <AuthShell
      wide
      title="Créer un compte"
      subtitle="Rejoignez la communauté Nafissa — clientes ou prestataires."
    >
      {errors.general && (
        <div className="mb-5 p-4 bg-red-50 border border-red-100 text-danger text-sm rounded-xl">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Je suis</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      form.role === value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
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
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo de profil */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
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
              <p className="text-xs text-muted mt-1.5">JPG, PNG ou WebP — Max 3 Mo</p>
              {errors.photo && <p className="text-xs text-danger mt-1">{errors.photo[0]}</p>}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="name" name="name" type="text" required value={form.name} onChange={handleChange}
                  placeholder="Votre nom" className={inputClass('name')} />
              </div>
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="votre@email.com" className={inputClass('email')} />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email[0]}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+221 7X XXX XX XX" className={inputClass('phone')} />
              </div>
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone[0]}</p>}
            </div>

            {/* Genre + Date de naissance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Sélectionner</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="date_of_birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                {errors.date_of_birth && <p className="text-xs text-danger mt-1">{errors.date_of_birth[0]}</p>}
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange}
                  placeholder="Ex: Mermoz, Dakar" className={inputClass('address')} />
              </div>
              {errors.address && <p className="text-xs text-danger mt-1">{errors.address[0]}</p>}
            </div>

            {/* Pièce d'identité recto/verso (prestataires uniquement) */}
            {isPrestataire && (
              <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-medium text-amber-800">📋 Pièce d&apos;identité (obligatoire pour les prestataires)</p>
                <p className="text-xs text-amber-600">Formats acceptés : JPG, PNG, PDF — Max 5 Mo par fichier</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recto</label>
                    <label className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl cursor-pointer transition-colors text-sm ${
                      idCardRecto ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-muted hover:border-primary'
                    }`}>
                      <Upload size={16} />
                      <span className="truncate">{idCardRecto ? idCardRecto.name : 'Choisir un fichier'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={(e) => { setIdCardRecto(e.target.files[0] || null); setErrors((prev) => ({ ...prev, id_card_recto: undefined })); }} />
                    </label>
                    {errors.id_card_recto && <p className="text-xs text-danger mt-1">{errors.id_card_recto[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Verso</label>
                    <label className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl cursor-pointer transition-colors text-sm ${
                      idCardVerso ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-muted hover:border-primary'
                    }`}>
                      <Upload size={16} />
                      <span className="truncate">{idCardVerso ? idCardVerso.name : 'Choisir un fichier'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={(e) => { setIdCardVerso(e.target.files[0] || null); setErrors((prev) => ({ ...prev, id_card_verso: undefined })); }} />
                    </label>
                    {errors.id_card_verso && <p className="text-xs text-danger mt-1">{errors.id_card_verso[0]}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange} placeholder="Min. 8 caractères"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.password ? 'border-danger' : 'border-gray-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password[0]}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'}
                  required value={form.password_confirmation} onChange={handleChange} placeholder="Retapez le mot de passe"
                  className={inputClass('password_confirmation')} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Créer mon compte</>
              )}
            </button>
          </form>

      <p className="text-center mt-7 text-sm text-muted">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
