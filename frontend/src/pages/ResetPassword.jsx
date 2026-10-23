import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { authAPI } from '../api/services';
import { Lock, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('La confirmation ne correspond pas.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, ...form });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, autoComplete) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-[13px] font-bold text-gray-700">{label}</label>
      <div className="group relative">
        <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete={autoComplete}
          value={form[name]}
          onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3.5 pl-12 pr-12 text-sm text-gray-900 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
          aria-label={showPassword ? 'Masquer' : 'Afficher'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
      {done ? (
        <div className="space-y-6 text-center">
          <CheckCircle size={44} className="mx-auto text-emerald-500" />
          <p className="text-sm leading-relaxed text-gray-600">
            Votre mot de passe a été réinitialisé. Connectez-vous avec votre numéro de téléphone.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            Se connecter
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-danger">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {field('password', 'Nouveau mot de passe', 'new-password')}
          {field('password_confirmation', 'Confirmer le mot de passe', 'new-password')}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <><KeyRound size={17} /> Réinitialiser</>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
