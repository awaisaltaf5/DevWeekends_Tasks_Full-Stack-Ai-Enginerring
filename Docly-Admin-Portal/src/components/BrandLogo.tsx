import React from 'react';

interface BrandLogoProps {
  /** Height (Tailwind) of the logo. Defaults to h-9. */
  className?: string;
  /** Show only the logo mark (used off-screen mobile previews). */
  markOnly?: boolean;
}

/**
 * Docly brand mark + wordmark, sourced from the logo assets copied locally
 * from the main Docly project (public/logo.svg, public/logo-mark.svg).
 * Responsive: shows the full wordmark on >=sm and the mark on small screens,
 * exactly like the main Docly navbar.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-9', markOnly = false }) => {
  if (markOnly) {
    return <img src="/logo-mark.svg" alt="Docly" className={`w-auto ${className}`} />;
  }
  return (
    <span className="inline-flex items-center">
      <img src="/logo-mark.svg" alt="" className={`w-9 sm:hidden ${className.replace(/\bh-\S+/, '')}`} />
      <img src="/logo.svg" alt="Docly" className={`hidden h-auto sm:block ${className}`} />
    </span>
  );
};

export default BrandLogo;