import { type CSSProperties, useLayoutEffect, useRef } from "react";
import { IMAGENES, orbitarSatelites, SATELITES_CERCA } from "@/vistas/rr-dev/satelites";

interface SatellitesProps {
  /** Qué tan lejos está la cámara en cada cuadro: 0 con la Tierra de cerca y 1 un paso después */
  lejania: () => number;
}

/**
 * Los satélites que dan vueltas alrededor de la Tierra. Va dentro de la caja de la Tierra, y se
 * mide con ella. Cuando aparece la Tierra arrancan escondidos detrás de ella. Es decorativo.
 */
export function Satellites({ lejania }: SatellitesProps) {
  const capa = useRef<HTMLDivElement>(null);

  // Antes de pintar: si no, se verían un instante en el centro de la Tierra
  useLayoutEffect(() => {
    if (!capa.current) return;
    return orbitarSatelites(capa.current, lejania);
  }, [lejania]);

  return (
    <div ref={capa} className="satelites">
      {SATELITES_CERCA.map(({ tipo, ancho }, numero) => (
        <img
          key={numero}
          src={IMAGENES[tipo]}
          alt=""
          className="satelite"
          style={{ "--ancho-satelite": ancho } as CSSProperties}
        />
      ))}
    </div>
  );
}
