interface HeroBadgeProps {
  etiqueta: string;
}

/** Saludo chico arriba del nombre */
export function HeroBadge({ etiqueta }: HeroBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-borde bg-superficie/80 px-4 py-1.5 text-sm font-medium text-texto-suave backdrop-blur-sm">
      {etiqueta}
    </span>
  );
}
