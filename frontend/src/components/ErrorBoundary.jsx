import { Component } from 'react';
import BrandMark from './BrandMark';

/**
 * Filet de sécurité React : si un écran plante (ex. chunk lazy non chargé sur
 * réseau instable), on affiche une page de repli au lieu d'un écran blanc.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Journal console uniquement : pas de fuite de données vers l'utilisateur.
    console.error('ErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
        <BrandMark to="/" logoClassName="h-20 w-auto" />
        <h1 className="mt-10 text-xl font-bold text-gray-900">Un problème est survenu</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          La page n&apos;a pas pu se charger. Vérifiez votre connexion puis réessayez.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark"
        >
          Recharger la page
        </button>
      </div>
    );
  }
}
