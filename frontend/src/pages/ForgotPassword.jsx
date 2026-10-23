import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { authAPI } from '../api/services';
import { Phone, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(phone.trim());
    } catch {
      // Réponse volontairement identique qu'un compte existe ou non.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation sur votre numéro WhatsApp."
    >
      {sent ? (
        <div className="space-y-6 text-center">
          <CheckCircle size={44} className="mx-auto text-emerald-500" />
          <p className="text-sm leading-relaxed text-gray-600">
            Si un compte correspond à ce numéro, vous recevrez un{' '}
            <strong>lien de réinitialisation par WhatsApp</strong> sous quelques instants
            (valable 30 minutes).
          </p>
          <p className="text-xs text-gray-400">
            Pas de WhatsApp ? Contactez-nous au +221 33 830 61 57.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark"
          >
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-[13px] font-bold text-gray-700">
              Numéro de téléphone du compte
            </label>
            <div className="group relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary"
              />
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77 123 45 67"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/12"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Le numéro utilisé à l&apos;inscription ou lors de votre demande.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <><KeyRound size={17} /> Envoyer le lien par WhatsApp</>
            )}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"
          >
            <ArrowLeft size={15} /> Retour à la connexion
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
