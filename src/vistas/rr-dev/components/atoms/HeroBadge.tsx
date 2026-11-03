interface HeroBadgeProps {
  etiqueta: string;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/** Saludo chico arriba del nombre */
export function HeroBadge({ etiqueta, encender }: HeroBadgeProps) {
  return (
    <span
      data-encender={encender}
      className="inline-flex items-center rounded-full border border-borde bg-superficie/80 px-4 py-1.5 text-sm font-medium text-texto-suave backdrop-blur-sm"
    >
      {etiqueta}
    </span>
  );
}
