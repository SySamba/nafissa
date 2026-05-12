import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/services';
import { User, Mail, Phone, MapPin, FileText, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  maman: 'Cliente (Maman)',
  etudiant: 'Étudiant(e)',
  artisan: 'Artisan(e)',
  admin: 'Administrateur',
};

export default function Profile() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.profile?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authAPI.updateProfile(form);
      await loadUser();
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        {/* En-tête profil */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-white/80 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 bg-white/20 text-white text-xs px-3 py-0.5 rounded-full font-medium">
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6 sm:p-8">
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-danger'
            }`}>
              <Check size={16} /> {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" disabled value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-muted cursor-not-allowed" />
              </div>
              <p className="text-xs text-muted mt-1">L&apos;email ne peut pas être modifié.</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+221 7X XXX XX XX"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange}
                  placeholder="Ex: Mermoz, Dakar"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio / Description</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-muted" />
                <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange}
                  placeholder="Présentez-vous en quelques mots..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="bg-surface rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations du compte</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted">Rôle</p>
            <p className="font-medium">{ROLE_LABELS[user?.role]}</p>
          </div>
          <div>
            <p className="text-muted">Statut</p>
            <p className={`font-medium ${user?.verified ? 'text-secondary' : 'text-amber-600'}`}>
              {user?.verified ? 'Vérifié' : 'En attente de validation'}
            </p>
          </div>
          {user?.profile?.rating > 0 && (
            <div>
              <p className="text-muted">Note</p>
              <p className="font-medium text-accent">{user.profile.rating} / 5</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
