import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceAPI, categoryAPI } from '../api/services';
import { Search, MapPin, Filter, Plus, X, Edit, Trash2, User } from 'lucide-react';
import { categoryVisual } from '../lib/categoryImages';

const ICON_MAP = {
  home: '🏠', baby: '👶', scissors: '✂️', utensils: '🍳',
  'book-open': '📚', sparkles: '✨', wrench: '🔧', zap: '⚡',
};
export default function Services() {
  const { isPrestataire, user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '', sort_by: 'created_at' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      if (isPrestataire) {
        // Le prestataire ne voit que SES propres services
        const { data } = await serviceAPI.mine();
        setServices(data.services || []);
        setLastPage(1);
      } else {
        // Client / public : voit tous les services disponibles
        const params = { ...filters, page };
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        const { data } = await serviceAPI.list(params);
        setServices(data.data || []);
        setLastPage(data.last_page || 1);
      }
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  }, [filters, page, isPrestataire]);

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDelete = async (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer ce service ?')) return;
    setDeleting(serviceId);
    try {
      await serviceAPI.remove(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/services/${serviceId}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPrestataire ? 'Mes services' : 'Services'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {isPrestataire ? 'Gérez vos services proposés' : 'Trouvez le service et le prestataire parfait pour vos besoins'}
          </p>
        </div>
        {isPrestataire && user?.verified && (
          <Link to="/services/create"
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={18} /> Nouveau service
          </Link>
        )}
      </div>

      {/* Barre de recherche et filtres (uniquement pour client / public) */}
      {!isPrestataire && (
        <>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Rechercher un service..." className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              {filters.search && (
                <button onClick={() => handleFilterChange('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface border-gray-200 text-muted hover:border-primary hover:text-primary'}`}>
              <Filter size={16} /> Filtres
            </button>
          </div>

          {/* Panneau filtres */}
          {showFilters && (
            <div className="bg-surface border border-gray-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={filters.category_id} onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{ICON_MAP[cat.icon] || '📌'} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select value={filters.sort_by} onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="created_at">Plus récents</option>
                  <option value="price">Prix</option>
                  <option value="title">Nom</option>
                </select>
              </div>
            </div>
          )}

          {/* Pastilles catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => handleFilterChange('category_id', '')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${!filters.category_id ? 'bg-primary text-white' : 'bg-surface border border-gray-200 text-muted hover:border-primary hover:text-primary'}`}>
              Tous
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => handleFilterChange('category_id', String(cat.id))}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${String(filters.category_id) === String(cat.id) ? 'bg-primary text-white' : 'bg-surface border border-gray-200 text-muted hover:border-primary hover:text-primary'}`}>
                {ICON_MAP[cat.icon] || '📌'} {cat.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Grille de services */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
          <Search size={48} className="mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isPrestataire ? 'Vous n\'avez aucun service' : 'Aucun service trouvé'}
          </h3>
          <p className="text-muted text-sm mt-1">
            {isPrestataire ? 'Créez votre premier service pour commencer.' : 'Essayez avec d\'autres critères de recherche.'}
          </p>
          {isPrestataire && user?.verified && (
            <Link to="/services/create" className="inline-flex items-center gap-2 mt-4 bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <Plus size={16} /> Créer un service
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link key={service.id} to={`/services/${service.id}`}
              className="bg-surface rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group relative block">
              <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${categoryVisual(service.category || {}).gradient}`}>
                <img
                  src={categoryVisual(service.category || {}).image}
                  alt={service.category?.name || 'Service'}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm bg-black/25 px-2 py-0.5 rounded-md backdrop-blur-[2px]">
                  {service.category?.name || 'Service'}
                </span>
              </div>
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {service.category?.name}
                  </span>
                  <span className="text-lg font-bold text-secondary">{Number(service.price).toLocaleString()} FCFA</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{service.description}</p>

                {/* Footer: localisation uniquement pour client, provider info pour prestataire */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  {service.location && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <MapPin size={12} /> {service.location}
                    </span>
                  )}
                </div>

                {/* Boutons Modifier / Supprimer (prestataire propriétaire uniquement) */}
                {isPrestataire && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={(e) => handleEdit(e, service.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                      <Edit size={14} /> Modifier
                    </button>
                    <button onClick={(e) => handleDelete(e, service.id)} disabled={deleting === service.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-danger rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50">
                      <Trash2 size={14} /> {deleting === service.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination (uniquement pour client/public) */}
      {!isPrestataire && lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Précédent
          </button>
          <span className="text-sm text-muted">Page {page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
