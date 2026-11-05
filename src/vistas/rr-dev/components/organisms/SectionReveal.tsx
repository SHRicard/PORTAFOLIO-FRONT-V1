import { useRef, type ReactNode } from "react";
import { useEncendido } from "@/vistas/rr-dev/hooks/useEncendido";

interface SectionRevealProps {
  children: ReactNode;
}

/**
 * El contenido de un apartado, que entra encendiéndose pieza por pieza mientras la cámara del
 * espacio viaja por detrás. Cada pieza dice cuándo le toca con `data-encender` (ver `useEncendido`)
 */
export function SectionReveal({ children }: SectionRevealProps) {
  const raiz = useRef<HTMLDivElement>(null);
  const luces = useRef<HTMLDivElement>(null);
  useEncendido(raiz, luces);

  return (
    <div ref={raiz} className="rr-dev relative">
      {children}
      <div ref={luces} aria-hidden className="luces-encendido" />
    </div>
  );
}
