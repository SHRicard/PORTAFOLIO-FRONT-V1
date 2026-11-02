import type { Logo } from "@/vistas/rr-dev/logos";

interface BrandLogoProps {
  logo: Logo;
  className?: string;
}

/** Logo de una marca en el color del texto. Es decorativo: el que lo usa dice qué es. */
export function BrandLogo({ logo, className }: BrandLogoProps) {
  return (
    <svg viewBox={logo.caja} fill="currentColor" className={className} aria-hidden>
      <path d={logo.trazo} />
    </svg>
  );
}
