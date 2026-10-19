import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { LogIn, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const looksLikePhone =
    /^[+\d]/.test(form.login.trim()) && !form.login.trim().includes('@');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ login: form.login.trim(), password: form.password });
      navigate('/dashboard');
    } catch (err) {
      const fallback =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? "Impossible de joindre le serveur (vérifiez que l'API tourne et que le proxy Vite pointe vers le bon port)."
          : 'Erreur de connexion.';
      const msg = err.response?.data?.message || fallback;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace personnel avec votre email ou numéro de téléphone."
    >
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-danger"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login" className="mb-2 block text-[13px] font-bold text-gray-700">
            Email ou téléphone
          </label>
          <div className="group relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">
              {looksLikePhone ? <Phone size={18} /> : <Mail size={18} />}
            </span>
            <input
              id="login"
              name="login"
              type={looksLikePhone ? 'tel' : 'text'}
              required
              autoComplete="username"
              inputMode={looksLikePhone ? 'tel' : 'email'}
              value={form.login}
              onChange={handleChange}
              placeholder="vous@email.com ou 77 378 48 14"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Utilisez l&apos;email ou le numéro fourni à l&apos;inscription.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-bold text-gray-700">
            Mot de passe
          </label>
          <div className="group relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-primary focus:text-primary"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Cliquez sur l&apos;œil pour afficher ou masquer le mot de passe.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Connexion…
            </>
          ) : (
            <>
              <LogIn size={18} />
              Se connecter
              <ArrowRight
                size={16}
                className="opacity-60 transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200/80" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ou</span>
        <span className="h-px flex-1 bg-gray-200/80" />
      </div>

      <Link
        to="/register"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 py-3.5 text-sm font-bold text-gray-700 transition-all hover:border-secondary hover:bg-secondary/5 hover:text-secondary-dark"
      >
        Créer un compte gratuit
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
        <ShieldCheck size={14} className="text-secondary" />
        Connexion sécurisée et chiffrée
      </div>
    </AuthShell>
  );
}
