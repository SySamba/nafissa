import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackingAPI } from '../api/services';
import usePolling from '../hooks/usePolling';
import BrandMark from '../components/BrandMark';
import { statusConfig } from '../lib/bookingStatus';
import {
  Calendar, Clock, MapPin, Check, AlertCircle, CreditCard, User, KeyRound, CheckCircle,
} from 'lucide-react';

/** Bloc « créer mon accès » : la cliente définit un mot de passe grâce au lien de suivi. */
function SetPasswordCard({ token }) {
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await trackingAPI.setPassword(token, form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de définir le mot de passe.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-semibold text-gray-800">
          Mot de passe créé ! Connectez-vous avec votre numéro de téléphone.
        </p>
        <Link to="/login" className="mt-3 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
        <KeyRound size={16} className="text-primary" /> Créer mon accès
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Choisissez un mot de passe pour retrouver toutes vos demandes dans votre espace
        (connexion avec votre numéro de téléphone).
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mot de passe (8 caractères min.)"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Confirmer le mot de passe"
          value={form.password_confirmation}
          onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Créer mon mot de passe'}
        </button>
      </form>
    </div>
  );
}

const STEPS = [
  { key: 'en_attente_admin', label: 'Demande reçue' },
  { key: 'en_attente_prestataire', label: 'Prestataire trouvé' },
  { key: 'acceptee', label: 'Prestataire confirmé' },
  { key: 'payee', label: 'Paiement' },
  { key: 'en_cours', label: 'Mission en cours' },
  { key: 'terminee', label: 'Terminée' },
];

const HINTS = {
  en_attente_admin: "Notre équipe examine votre demande et sélectionne le meilleur prestataire disponible.",
  en_attente_prestataire: 'Un prestataire a été choisi pour vous. En attente de sa confirmation.',
  acceptee: 'Le prestataire a accepté. Notre équipe vous contactera pour organiser la suite.',
  payee: 'Paiement enregistré. La mission va pouvoir démarrer.',
  en_cours: 'La mission est en cours de réalisation.',
  terminee: 'La mission est terminée. Merci pour votre confiance !',
  annulee: 'Cette demande a été annulée. Contactez-nous pour toute question.',
  refusee: 'Cette demande a été refusée. Contactez-nous pour toute question.',
};

/** Page publique de suivi : pas de compte, accessible via le lien WhatsApp. */
export default function Tracking() {
  const { token } = useParams();
  const [demande, setDemande] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDemande = useCallback(() => {
    trackingAPI
      .show(token)
      .then(({ data }) => setDemande(data.demande))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchDemande(); }, [fetchDemande]);
  usePolling(fetchDemande, 15000, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !demande) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
        <AlertCircle size={40} className="text-gray-300" />
        <p className="font-semibold text-gray-700">Ce lien de suivi est invalide ou a expiré.</p>
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const cfg = statusConfig(demande.status);
  const stepIdx = STEPS.findIndex((s) => s.key === demande.status);
  const closed = demande.status === 'annulee' || demande.status === 'refusee';

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-gray-100 bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <BrandMark to="/" compact logoClassName="h-10 w-auto" />
          <span className="text-xs font-semibold text-muted">Suivi de demande</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <div className="rounded-2xl border border-gray-100 bg-surface p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Demande n°{demande.numero}</p>
              <h1 className="mt-1.5 text-xl font-bold text-gray-900">{demande.service ?? demande.categorie ?? 'Demande'}</h1>
              {demande.categorie && <p className="text-sm text-muted">{demande.categorie}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-2"><Calendar size={15} className="text-primary" />{new Date(demande.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span className="flex items-center gap-2"><Clock size={15} className="text-primary" />{demande.heure}{demande.duree ? ` · ${demande.duree}` : ''}</span>
            {demande.lieu && <span className="flex items-center gap-2"><MapPin size={15} className="text-primary" />{demande.lieu}</span>}
            {demande.montant != null && <span className="flex items-center gap-2"><CreditCard size={15} className="text-primary" />{Number(demande.montant).toLocaleString('fr-FR')} FCFA</span>}
          </div>

          {demande.prestataire && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary/5 border border-secondary/15 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15 text-secondary"><User size={18} /></div>
              <div>
                <p className="text-sm font-bold text-gray-900">{demande.prestataire.nom}</p>
                <p className="text-xs text-muted">Prestataire attribué à votre demande</p>
              </div>
            </div>
          )}
        </div>

        {!closed ? (
          <div className="rounded-2xl border border-gray-100 bg-surface p-6">
            <h2 className="mb-5 text-sm font-bold text-gray-700">Progression</h2>
            <ol className="space-y-0">
              {STEPS.map((step, i) => {
                const done = stepIdx >= 0 && i <= stepIdx;
                const current = i === stepIdx;
                return (
                  <li key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                      } ${current ? 'ring-4 ring-primary/15' : ''}`}>
                        {done ? <Check size={13} /> : i + 1}
                      </div>
                      {i < STEPS.length - 1 && <div className={`my-1 w-0.5 flex-1 rounded ${i < stepIdx ? 'bg-primary' : 'bg-gray-100'}`} style={{ minHeight: '18px' }} />}
                    </div>
                    <p className={`pb-4 text-sm ${current ? 'font-bold text-primary' : done ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-danger">{HINTS[demande.status]}</p>
        )}

        {!closed && HINTS[demande.status] && (
          <p className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-gray-700">
            {HINTS[demande.status]}
          </p>
        )}

        <SetPasswordCard token={token} />

        <div className="rounded-2xl border border-gray-100 bg-surface p-5 text-center">
          <p className="text-sm text-muted">Besoin d'un autre service ?</p>
          <Link to="/demande" className="mt-2 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
            Faire une nouvelle demande
          </Link>
        </div>
      </main>
    </div>
  );
}
