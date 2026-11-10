import { type RefObject, useLayoutEffect, useState } from "react";

/** Las partes de la escena que tienen que entrar en su lugar: las marcadas con `data-encaja` */
const partesDe = (escena: HTMLElement) => [...escena.querySelectorAll<HTMLElement>("[data-encaja]")];

/**
 * Alguna parte es más alta que el lugar que le da su caja. Se mide su alto propio y no el scroll:
 * así no cuentan los vidrios que sobresalen un poco ni las piezas que se encienden agrandándose
 */
export function sePasa(escena: HTMLElement): boolean {
  return partesDe(escena).some((parte) => parte.offsetHeight - (parte.parentElement?.clientHeight ?? Infinity) > 1);
}

/**
 * Cuántos de `total` párrafos entran en la escena sin que nada se pase de su lugar. Arranca con
 * todos y, antes de pintar, saca de a uno desde el último hasta que entra, dejando siempre el
 * primero. Si cambia el lugar (otra pantalla, o llegó algo que ocupa espacio debajo), vuelve a probar
 * con todos. Lo que no entra se lee en el panel con «Seguir leyendo»
 */
export function useParrafosQueEntran(escena: RefObject<HTMLElement | null>, total: number): number {
  const [prueba, setPrueba] = useState({ total, visibles: total });
  // Con otra cantidad de párrafos (llegó la bio), vuelve a probar con todos
  if (prueba.total !== total) setPrueba({ total, visibles: total });

  useLayoutEffect(() => {
    const caja = escena.current;
    if (caja && prueba.visibles > 1 && sePasa(caja)) {
      setPrueba((antes) => ({ ...antes, visibles: antes.visibles - 1 }));
    }
  });

  // Se miran los lugares y no las partes: las partes cambian de alto justamente al sacar párrafos
  useLayoutEffect(() => {
    const caja = escena.current;
    if (!caja || typeof ResizeObserver === "undefined") return;
    const lugares = [caja, ...partesDe(caja).map((parte) => parte.parentElement)].filter(
      (lugar): lugar is HTMLElement => lugar !== null,
    );
    const medida = (lugar: Element) => `${lugar.clientWidth}x${lugar.clientHeight}`;
    const medidas = new Map<Element, string>(lugares.map((lugar) => [lugar, medida(lugar)]));
    const observador = new ResizeObserver((cambios) => {
      const cambio = cambios.some(({ target }) => medidas.get(target) !== medida(target));
      cambios.forEach(({ target }) => medidas.set(target, medida(target)));
      if (cambio) setPrueba((antes) => ({ ...antes, visibles: antes.total }));
    });
    medidas.forEach((_, lugar) => observador.observe(lugar));
    return () => observador.disconnect();
  }, [escena]);

  return Math.min(prueba.visibles, total);
}
