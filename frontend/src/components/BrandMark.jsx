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
  logoClassName,
}) {
  const size = compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl';
  const tracking = compact ? 'tracking-[0.14em]' : 'tracking-[0.22em]';
  const tone = light ? 'text-white' : 'text-primary-dark';
  const logoSize = logoClassName || (compact ? 'h-10' : 'h-12 sm:h-14');
  return (
    <Link
      to={to}
      onClick={onAfterNavigate}
      className={`inline-flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity ${className}`}
    >
      <img
        src="/logo-nafissa.png"
        alt="NAFISSA"
        className={`${logoSize} w-auto shrink-0 object-contain ${light ? 'rounded-2xl bg-white/95 p-2 shadow-sm' : ''}`}
      />
      {showText ? (
        <span className={`font-black font-display uppercase ${size} ${tracking} ${tone}`}>
          NAFISSA
        </span>
      ) : null}
    </Link>
  );
}
