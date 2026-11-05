import { useEffect, useRef } from "react";
import { SOL } from "@/vistas/rr-dev/astros";
import { encenderLlamas } from "@/vistas/rr-dev/llamas";
import { girarAstro } from "@/vistas/rr-dev/rotacion";

/**
 * El sol, centro del sistema, girando despacio sobre su eje, con un anillo de llamas y la luz que
 * irradia. Mientras bajan los fotogramas, y si el sistema pide menos movimiento, queda el primero
 * quieto. Es decorativo y llena su contenedor, que tiene que estar posicionado.
 */
export function Sun() {
  const llamas = useRef<HTMLCanvasElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!llamas.current) return;
    return encenderLlamas(llamas.current);
  }, []);

  useEffect(() => {
    if (!foto.current || !lienzo.current) return;
    return girarAstro(lienzo.current, foto.current, SOL);
  }, []);

  return (
    <div aria-hidden className="sol">
      <canvas ref={llamas} className="sol-llamas" />
      <img ref={foto} src={SOL.fotogramas[0]} alt="" />
      <canvas ref={lienzo} />
    </div>
  );
}
