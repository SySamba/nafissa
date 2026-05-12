import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAPI, categoryAPI } from '../api/services';
import { ArrowLeft, Plus } from 'lucide-react';

export default function ServiceCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', price: '', location: '' });
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="bg-surface rounded-2xl border border-gray-100 p-6 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Nouveau service</h1>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">{errors.general[0]}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
            <select id="category_id" name="category_id" required value={form.category_id} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            {errors.category_id && <p className="text-xs text-danger mt-1">{errors.category_id[0]}</p>}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Titre du service</label>
            <input id="title" name="title" type="text" required value={form.title} onChange={handleChange}
              placeholder="Ex: Soutien scolaire en mathématiques"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title[0]}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange}
              placeholder="Décrivez votre service en détail..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            {errors.description && <p className="text-xs text-danger mt-1">{errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Prix (FCFA)</label>
              <input id="price" name="price" type="number" min="0" step="100" required value={form.price} onChange={handleChange}
                placeholder="Ex: 2000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              {errors.price && <p className="text-xs text-danger mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange}
                placeholder="Ex: Mermoz, Dakar"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              {errors.location && <p className="text-xs text-danger mt-1">{errors.location[0]}</p>}
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
