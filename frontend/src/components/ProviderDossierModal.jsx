import {
  X, Star, Mail, Phone, MapPin, Users, Calendar, FileImage, XCircle, CheckCircle,
  Briefcase, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { priceUnitSuffix } from '../lib/pricing';

const ROLE_LABELS = { maman: 'Cliente', etudiant: 'Prestataire (étudiant)', artisan: 'Prestataire', admin: 'Admin' };

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
const fmtPrice = (p, unit) => `${Number(p).toLocaleString('fr-FR')} FCFA${priceUnitSuffix(unit)}`;

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

function IdCard({ label, path }) {
  const url = `/storage/${path}`;
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <p className="text-xs font-bold text-gray-500 px-3 py-1.5 bg-gray-50">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block hover:bg-primary/5">
        {path.toLowerCase().endsWith('.pdf') ? (
          <span className="block p-4 text-center text-primary text-sm font-bold">
            <FileImage size={32} className="mx-auto mb-1" /> Voir le PDF
          </span>
        ) : (
          <img src={url} alt={label} className="w-full h-32 object-cover" />
        )}
      </a>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${tone}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

/**
 * Dossier complet d'un prestataire, affiché à l'admin au moment de l'attribution.
 * `onAssign` (optionnel) ajoute un bouton « Attribuer » dans le pied de la fenêtre.
 */
export default function ProviderDossierModal({ provider, onClose, onAssign, assigning = false }) {
  if (!provider) return null;
  const p = provider;
  const services = Array.isArray(p.services) ? p.services : [];
  const reviews = Array.isArray(p.recent_reviews) ? p.recent_reviews : [];
  const busyTimes = Array.isArray(p.busy_times) ? p.busy_times : [];
  const gender = p.gender === 'homme' ? 'Homme' : p.gender === 'femme' ? 'Femme' : 'Non renseigné';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Dossier du prestataire</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Identité */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary-dark text-white rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
              {p.photo ? <img src={`/storage/${p.photo}`} alt="" className="w-full h-full object-cover" /> : p.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{ROLE_LABELS[p.role]}</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Compte vérifié</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                <Stars value={p.rating || 0} size={16} />
                <span className="font-bold text-gray-700">{p.rating > 0 ? `${p.rating}/5` : 'Pas encore noté'}</span>
                {p.reviews_count > 0 && <span className="text-gray-400">({p.reviews_count} avis)</span>}
              </div>
            </div>
          </div>

          {p.a_refuse && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              <XCircle size={18} className="shrink-0 mt-0.5" />
              Ce prestataire a déjà refusé cette demande. Réattribuez-la uniquement si vous l'avez confirmé avec lui.
            </p>
          )}

          {/* Disponibilité le jour demandé */}
          {p.busy_same_day > 0 ? (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>
                Déjà {p.busy_same_day} mission{p.busy_same_day > 1 ? 's' : ''} active{p.busy_same_day > 1 ? 's' : ''} le jour demandé
                {busyTimes.length ? ` (à ${busyTimes.join(', ')})` : ''}. Vérifiez la compatibilité des horaires.
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              <CheckCircle size={18} className="shrink-0" /> Aucune autre mission prévue le jour demandé.
            </p>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Stat value={p.missions_terminees ?? 0} label="Missions terminées" tone="bg-secondary/5 border-secondary/20 text-secondary" />
            <Stat value={p.missions_en_cours ?? 0} label="Missions en cours" tone="bg-primary/5 border-primary/20 text-primary" />
            <Stat value={p.missions_annulees ?? 0} label="Missions annulées" tone="bg-red-50 border-red-100 text-danger" />
            <Stat
              value={p.category_price != null ? fmtPrice(p.category_price, 'mission') : '—'}
              label="Tarif dans cette catégorie"
              tone="bg-amber-50 border-amber-100 text-amber-700"
            />
          </div>

          {/* Informations personnelles */}
          <div className="bg-gray-50/80 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Informations personnelles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-2 min-w-0"><Mail size={14} className="text-primary shrink-0" /><span className="truncate">{p.email}</span></span>
              <span className="flex items-center gap-2"><Phone size={14} className="text-primary shrink-0" />{p.phone || 'Non renseigné'}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-primary shrink-0" />{p.address || p.location || 'Non renseigné'}</span>
              {p.distance_km != null && (
                <span className={`flex items-center gap-2 font-semibold ${p.distance_km <= 3 ? 'text-green-600' : 'text-secondary'}`}>
                  <MapPin size={14} className="shrink-0" />
                  À {p.distance_km} km du lieu d'intervention{p.zone ? ` (${p.zone})` : ''}
                  {p.distance_km <= 3 ? ' — très proche' : ''}
                </span>
              )}
              {p.distance_km == null && p.zone && (
                <span className="flex items-center gap-2"><MapPin size={14} className="text-primary shrink-0" />Secteur : {p.zone}</span>
              )}
              <span className="flex items-center gap-2"><Users size={14} className="text-primary shrink-0" />{gender}</span>
              {p.date_of_birth && (
                <span className="flex items-center gap-2"><Calendar size={14} className="text-primary shrink-0" />Né(e) le {fmtDate(p.date_of_birth)}</span>
              )}
              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary shrink-0" />Inscrit le {fmtDate(p.created_at)}</span>
            </div>
          </div>

          {p.bio && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">Présentation</h4>
              <p className="text-sm text-gray-600 bg-gray-50/80 rounded-xl p-3 leading-relaxed whitespace-pre-line">{p.bio}</p>
            </div>
          )}

          {/* Services proposés */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Briefcase size={16} className="text-primary" /> Services proposés ({services.length})
            </h4>
            {services.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun service publié.</p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200/70">
                {services.map((s) => (
                  <li key={s.id} className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm ${s.same_category ? 'bg-primary/5' : ''}`}>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                      <p className="text-xs text-gray-500">
                        {s.category}
                        {s.location ? ` · ${s.location}` : ''}
                        {s.same_category ? ' · catégorie demandée' : ''}
                        {!s.available ? ' · indisponible' : ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-secondary">{fmtPrice(s.price, s.price_unit)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Avis clientes */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" /> Derniers avis des clientes
            </h4>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>
            ) : (
              <ul className="space-y-2">
                {reviews.map((r, i) => (
                  <li key={i} className="rounded-xl bg-gray-50/80 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Stars value={r.rating} size={12} />
                        <span className="font-semibold text-gray-800">{r.client}</span>
                      </span>
                      <span className="text-xs text-gray-400">{r.service} · {fmtDate(r.date)}</span>
                    </div>
                    {r.review && <p className="mt-1.5 text-gray-600 leading-relaxed">{r.review}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pièce d'identité */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileImage size={16} className="text-primary" /> Pièce d&apos;identité
            </h4>
            {p.id_card_recto || p.id_card_verso ? (
              <div className="grid grid-cols-2 gap-3">
                {p.id_card_recto && <IdCard label="Recto" path={p.id_card_recto} />}
                {p.id_card_verso && <IdCard label="Verso" path={p.id_card_verso} />}
              </div>
            ) : (
              <p className="text-sm text-danger flex items-center gap-2 bg-red-50 p-3 rounded-xl">
                <XCircle size={16} /> Aucune pièce d&apos;identité fournie
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3.5 sm:px-6 sm:py-4 rounded-b-2xl flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Fermer
          </button>
          {onAssign && (
            <button type="button" onClick={onAssign} disabled={assigning}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
              {assigning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle size={16} /> Attribuer ce prestataire</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
