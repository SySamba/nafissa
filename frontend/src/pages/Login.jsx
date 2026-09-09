import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { LogIn, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

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
      const data = await login({ login: form.login.trim(), password: form.password });
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
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
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-danger">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="login" className="block text-sm font-semibold text-gray-800 mb-2">
            Email ou téléphone
          </label>
          <div className="relative group">
            {looksLikePhone ? (
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
            ) : (
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
            )}
            <input
              id="login"
              name="login"
              type={looksLikePhone ? 'tel' : 'text'}
              required
              autoComplete="username"
              inputMode={looksLikePhone ? 'tel' : 'email'}
              value={form.login}
              onChange={handleChange}
              placeholder="vous@email.com ou +221 77 …"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
            Mot de passe
          </label>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-primary" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Se connecter
              <ArrowRight size={16} className="opacity-70" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-100 py-3 text-xs font-medium text-gray-500">
        <ShieldCheck size={14} className="text-secondary" /> Connexion sécurisée et chiffrée
      </div>

      <p className="text-center mt-7 text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
          Créer un compte gratuit
        </Link>
      </p>
    </AuthShell>
  );
}
