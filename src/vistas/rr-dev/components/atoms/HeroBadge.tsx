import type { LucideIcon } from "lucide-react";

interface HeroBadgeProps {
  etiqueta: string;
  /** Un ícono chico adelante, como el lugar en Sobre mí */
  icono?: LucideIcon;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/** Saludo chico arriba del nombre */
export function HeroBadge({ etiqueta, icono: Icono, encender }: HeroBadgeProps) {
  return (
    <span
      data-encender={encender}
      className="inline-flex items-center gap-2 rounded-full border border-borde bg-superficie/80 px-4 py-1.5 text-sm font-medium text-texto-suave backdrop-blur-sm"
    >
      {Icono && <Icono className="size-3.75 shrink-0" aria-hidden />}
      {etiqueta}
    </span>
  );
}
