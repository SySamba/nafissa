import { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

/**
 * Invite d'installation PWA — popup automatique, page d'accueil uniquement.
 *
 * - Apparaît seule après ~4 s, en bas d'écran, SANS voile : la page reste
 *   utilisable et le défilement n'est jamais bloqué.
 * - Navigateur compatible → bouton « Installer » (prompt natif).
 * - Sinon → instructions adaptées (iOS : Partager → écran d'accueil ;
 *   Android : menu ⋮ → Installer l'application).
 * - Fermée ou installée → n'est pas re-proposée avant 7 jours.
 */

const DISMISS_KEY = 'nafissa-install-dismissed-at';
const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const SHOW_DELAY_MS = 4000;

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return at > 0 && Date.now() - at < RESHOW_AFTER_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Stockage indisponible : le popup se referme simplement pour la session.
  }
}

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone || dismissedRecently()) return undefined;

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    const beforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setVisible(false);
      markDismissed();
    };

    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const close = () => {
    setVisible(false);
    markDismissed();
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setVisible(false);
      markDismissed();
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer l'application NAFISSA"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-80"
    >
      <button
        type="button"
        onClick={close}
        className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download size={19} />
        </span>
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-bold text-gray-900">Installer NAFISSA</p>
          {deferredPrompt ? (
            <>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Accédez à vos demandes en un geste, comme une vraie application.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark"
              >
                <Download size={14} /> Installer l'application
              </button>
            </>
          ) : isIOS ? (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Dans Safari : <Share size={12} className="inline -translate-y-0.5 text-primary" />{' '}
              <b>Partager</b> puis <b>« Sur l'écran d'accueil »</b>.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Menu <b>⋮</b> du navigateur puis <b>« Installer l'application »</b> ou{' '}
              <b>« Ajouter à l'écran d'accueil »</b>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
