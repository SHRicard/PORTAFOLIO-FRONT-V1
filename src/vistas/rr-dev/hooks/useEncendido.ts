import { useLayoutEffect, type RefObject } from "react";
import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/*
 * Los tiempos del encendido, en ms. El dueño lo eligió en la muestra en cámara lenta: todo pasa
 * 3.3 veces más despacio que en la versión de 1.6 s
 */
/** Lo que dura el destello de cada estrella */
export const ESTRELLA = 2530;
/** Lo que tarda una pieza en asentarse, y cuánto después de su estrella arranca */
export const PIEZA = 2670;
export const DESPUES = 370;
/** Lo que tarda en aparecer una pieza sin estrella, como el vidrio de la barra de datos */
export const FUNDIDO = 1670;

const SALIDA = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * El contenido de un apartado se enciende pieza por pieza, como estrellas. Cada elemento con
 * `data-encender` (los ms en que le toca) destella con una estrella en su centro y aparece desde
 * un brillo desenfocado; con `data-sin-estrella` solo aparece. Una línea con `data-trazar` (cuándo
 * empieza) y `data-durante` (cuánto tarda) se dibuja de punta a punta. Las estrellas van en `luces`.
 * Lo que llega después, como los datos del perfil, se enciende a su hora o, si ya pasó, al llegar.
 * Lo oculto no se anima. Sin movimiento el contenido está desde el principio
 */
export function useEncendido(raiz: RefObject<HTMLElement | null>, luces: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const contenedor = raiz.current;
    const capa = luces.current;
    if (!contenedor || !capa || typeof contenedor.animate !== "function" || prefiereMenosMovimiento()) return;

    const inicio = performance.now();
    const animaciones: Animation[] = [];
    const relojes: number[] = [];
    const vistos = new WeakSet<Element>();
    /** Cuánto falta para los ms de una pieza: si ya pasaron, nada */
    const falta = (ms: string | undefined) => Math.max(0, (Number(ms) || 0) - (performance.now() - inicio));
    const nuevo = (el: Element) => {
      if (vistos.has(el)) return false;
      vistos.add(el);
      return el.getClientRects().length > 0;
    };

    const destellar = (pieza: Element) => {
      const r = pieza.getBoundingClientRect();
      const base = contenedor.getBoundingClientRect();
      const tam = Math.max(30, Math.min(84, Math.max(r.width, r.height) * 0.35));
      const estrella = document.createElement("span");
      estrella.className = "estrella-encendido";
      Object.assign(estrella.style, {
        left: `${r.left - base.left + r.width / 2 - tam / 2}px`,
        top: `${r.top - base.top + r.height / 2 - tam / 2}px`,
        width: `${tam}px`,
        height: `${tam}px`,
      });
      capa.append(estrella);
      animaciones.push(
        estrella.animate(
          [
            { opacity: 0, transform: "scale(0) rotate(-25deg)" },
            { opacity: 1, transform: "scale(1.15) rotate(0deg)", offset: 0.3 },
            { opacity: 0, transform: "scale(0.3) rotate(30deg)" },
          ],
          { duration: ESTRELLA, easing: "ease-out", fill: "both" },
        ),
      );
    };

    const encender = (pieza: HTMLElement) => {
      if (!nuevo(pieza)) return;
      const demora = falta(pieza.dataset.encender);
      if ("sinEstrella" in pieza.dataset) {
        animaciones.push(
          pieza.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FUNDIDO, delay: demora, easing: SALIDA, fill: "backwards" }),
        );
        return;
      }
      // La estrella se ubica recién cuando le toca: para entonces los datos ya pudieron mover la pieza
      relojes.push(window.setTimeout(() => destellar(pieza), demora));
      animaciones.push(
        pieza.animate(
          [
            { opacity: 0, filter: "brightness(2.6) blur(6px)", transform: "scale(0.92)" },
            { opacity: 1, offset: 0.3 },
            { opacity: 1, filter: "brightness(1) blur(0px)", transform: "none" },
          ],
          { duration: PIEZA, delay: demora + DESPUES, easing: SALIDA, fill: "backwards" },
        ),
      );
    };

    const trazar = (linea: SVGGeometryElement) => {
      if (!nuevo(linea) || typeof linea.getTotalLength !== "function") return;
      const largo = linea.getTotalLength();
      animaciones.push(
        linea.animate(
          [
            { strokeDasharray: `${largo}`, strokeDashoffset: largo },
            { strokeDasharray: `${largo}`, strokeDashoffset: 0 },
          ],
          { duration: Number(linea.dataset.durante) || 0, delay: falta(linea.dataset.trazar), fill: "backwards" },
        ),
      );
    };

    const buscarEn = (nodo: Element) => {
      if (nodo.matches("[data-encender]")) encender(nodo as HTMLElement);
      if (nodo.matches("[data-trazar]")) trazar(nodo as SVGGeometryElement);
      nodo.querySelectorAll<HTMLElement>("[data-encender]").forEach(encender);
      nodo.querySelectorAll<SVGGeometryElement>("[data-trazar]").forEach(trazar);
    };

    buscarEn(contenedor);
    const observador = new MutationObserver((cambios) =>
      cambios.forEach(({ addedNodes }) => addedNodes.forEach((nodo) => nodo instanceof Element && buscarEn(nodo))),
    );
    observador.observe(contenedor, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      relojes.forEach((reloj) => window.clearTimeout(reloj));
      animaciones.forEach((animacion) => animacion.cancel());
      capa.replaceChildren();
    };
  }, [raiz, luces]);
}
