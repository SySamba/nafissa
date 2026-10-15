import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const beforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    // iOS n'a pas beforeinstallprompt : afficher un guide.
    const ua = navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    setIsIOS(isAppleDevice);
    setIsInstalled(isStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  if (isIOS && !deferredPrompt) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        title="Sur iPhone/iPad : appuyez sur Partager puis 'Sur l'écran d'accueil'"
      >
        <Download size={18} /> Installer
      </button>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
    >
      <Download size={18} /> Installer
    </button>
  );
}
