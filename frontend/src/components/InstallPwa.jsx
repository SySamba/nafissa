import { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

/**
 * Bouton « Installer l'application » (PWA).
 * - Navigateur compatible → prompt natif d'installation (Android, Chrome/Edge desktop)
 * - Sinon → panneau d'aide adapté (iOS : Partager → écran d'accueil ;
 *   Android : menu ⋮ → Installer l'application)
 */
export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const beforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    const ua = navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    setIsIOS(isAppleDevice);
    setIsInstalled(Boolean(isStandalone));

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    setShowHelp((v) => !v);
  };

  if (isInstalled) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
      >
        <Download size={18} /> Installer
      </button>

      {showHelp && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-xl">
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="absolute right-2 top-2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
          <p className="mb-2 font-bold text-gray-900">Installer NAFISSA</p>
          {isIOS ? (
            <p className="leading-relaxed">
              Sur iPhone/iPad : appuyez sur <Share size={14} className="inline -translate-y-0.5 text-primary" />{' '}
              <b>Partager</b> dans Safari, puis choisissez{' '}
              <b>« Sur l'écran d'accueil »</b>.
            </p>
          ) : (
            <p className="leading-relaxed">
              Ouvrez le menu <b>⋮</b> de votre navigateur puis choisissez{' '}
              <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
