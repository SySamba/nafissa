import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceAPI, categoryAPI } from '../api/services';
import { ArrowLeft, Plus, Clock } from 'lucide-react';
import { priceUnitOptions } from '../lib/pricing';

export default function ServiceCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', price: '', price_unit: 'mission', location: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await serviceAPI.create({ ...form, price: Number(form.price) });
      navigate('/services');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: [err.response?.data?.message || 'Erreur lors de la création.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Un prestataire non validé ne peut pas créer de service.
  if (user && !user.verified) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="bg-surface rounded-2xl border border-gray-100 p-8 text-center space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock size={26} />
          </span>
          <h1 className="text-xl font-bold text-gray-900">Compte en attente de validation</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Votre compte prestataire doit d'abord être validé par un administrateur avant de
            pouvoir publier des services. Vous serez notifié dès l'approbation.
          </p>
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="bg-surface rounded-2xl border border-gray-100 p-6 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Nouveau service</h1>
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 text-sm text-gray-700">
          Votre annonce rejoint le vivier : les clientes décrivent leur besoin et
          notre équipe vous attribue les demandes correspondantes. Décrivez ce que
          vous faites le mieux — pas besoin de viser tous les cas.
        </p>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">{errors.general[0]}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie *</label>
            <select id="category_id" name="category_id" required value={form.category_id} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            {errors.category_id && <p className="text-xs text-danger mt-1">{errors.category_id[0]}</p>}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Titre du service *</label>
            <input id="title" name="title" type="text" required maxLength={200} value={form.title} onChange={handleChange}
              placeholder="Ex: Ménage complet appartement, Repassage à domicile"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title[0]}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea id="description" name="description" rows={4} maxLength={2000} value={form.description} onChange={handleChange}
              placeholder="Détaillez ce que comprend votre prestation, votre expérience, le matériel fourni ou non…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            {errors.description && <p className="text-xs text-danger mt-1">{errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Prix indicatif par mission (FCFA) *</label>
              <input id="price" name="price" type="number" min="0" step="100" required value={form.price} onChange={handleChange}
                placeholder="Ex: 15000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              {errors.price && <p className="text-xs text-danger mt-1">{errors.price[0]}</p>}
              <p className="text-xs text-muted mt-1">Le prix définitif sera confirmé selon le besoin de la cliente.</p>
            </div>
            <div>
              <label htmlFor="price_unit" className="block text-sm font-medium text-gray-700 mb-1.5">Mode de tarification *</label>
              <select id="price_unit" name="price_unit" required value={form.price_unit} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {priceUnitOptions().map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Zone d&apos;intervention</label>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange}
                placeholder="Ex: Mermoz, Sacré-Cœur, Dakar"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              {errors.location && <p className="text-xs text-danger mt-1">{errors.location[0]}</p>}
              <p className="text-xs text-muted mt-1">Sert à vous proposer les demandes proches de vous.</p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus size={18} /> Publier le service</>}
          </button>
        </form>
      </div>
    </div>
  );
}
