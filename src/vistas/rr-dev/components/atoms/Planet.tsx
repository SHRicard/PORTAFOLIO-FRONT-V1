import { useEffect, useRef } from "react";
import { pasarCuadros } from "@/vistas/rr-dev/cuadros";
import { type Astro, girarAstro } from "@/vistas/rr-dev/rotacion";

interface PlanetProps {
  astro: Astro;
}

/**
 * Un planeta girando sobre su eje. Mientras bajan sus fotogramas, y si el sistema pide menos
 * movimiento, queda el primero quieto. Es decorativo y su contenedor le da la medida.
 */
export function Planet({ astro }: PlanetProps) {
  const foto = useRef<HTMLImageElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!foto.current || !lienzo.current) return;
    return (astro.deAUno ? pasarCuadros : girarAstro)(lienzo.current, foto.current, astro);
  }, [astro]);

  return (
    <div className="planeta">
      <img ref={foto} src={astro.fotogramas[0]} alt="" />
      <canvas ref={lienzo} />
    </div>
  );
}
