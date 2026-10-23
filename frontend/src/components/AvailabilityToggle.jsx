import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/services';

/**
 * Interrupteur de disponibilité prestataire.
 * Un prestataire indisponible n'est plus proposé par l'équipe
 * (exclu des suggestions et de l'attribution côté admin).
 */
export default function AvailabilityToggle() {
  const { user, loadUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const available = Boolean(user?.is_available);

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await authAPI.updateProfile({ is_available: !available });
      await loadUser();
    } catch {
      // Erreur réseau : l'état affiché reste inchangé, nouvelle tentative possible.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${
      available ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          <p className="text-sm font-bold text-gray-900">
            Disponibilité — {saving ? 'enregistrement…' : available ? 'Disponible' : 'Indisponible'}
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Active ta disponibilité pour permettre à l&apos;équipe de te proposer des missions.
          {available ? ' Tu reçois des propositions.' : ' Aucune proposition ne t\'est envoyée.'}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={available}
        aria-label="Recevoir des propositions"
        disabled={saving}
        onClick={toggle}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          available ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            available ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
