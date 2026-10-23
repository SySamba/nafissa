import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <BrandMark to="/" logoClassName="h-20 w-auto" />
      <p className="mt-10 text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 text-xl font-bold text-gray-900">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/demande"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark"
        >
          Faire une demande
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
