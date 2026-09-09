import { Link } from 'react-router-dom';

/**
 * Logo NAFISSA — image + texte, cohérent sur tout le site.
 */
export default function BrandMark({
  to = '/',
  className = '',
  light = false,
  compact = false,
  showText = false,
  onAfterNavigate,
}) {
  const size = compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl';
  const tracking = compact ? 'tracking-[0.14em]' : 'tracking-[0.22em]';
  const tone = light ? 'text-white' : 'text-primary-dark';
  const logoSize = compact ? 'h-10 w-10 sm:h-24 sm:w-24' : 'h-32 w-32 sm:h-36 sm:w-36';
  return (
    <Link
      to={to}
      onClick={onAfterNavigate}
      className={`inline-flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity ${className}`}
    >
      <img
        src="/logo-nafissa.png"
        alt="NAFISSA"
        className={`${logoSize} shrink-0 rounded-2xl object-contain ${light ? 'bg-white/95 p-2 shadow-sm' : ''}`}
      />
      {showText ? (
        <span className={`font-black font-display uppercase ${size} ${tracking} ${tone}`}>
          NAFISSA
        </span>
      ) : null}
    </Link>
  );
}
