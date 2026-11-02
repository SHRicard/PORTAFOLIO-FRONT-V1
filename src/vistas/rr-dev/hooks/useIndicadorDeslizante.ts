import { useLayoutEffect, type RefObject } from "react";

/**
 * Lleva el indicador hasta `enlaces[indice]` escribiendo --x y --w, sin volver a renderizar.
 * Después de ubicarlo la primera vez activa `data-listo`, para que el CSS recién ahí
 * habilite la animación y el indicador no entre volando al cargar la página.
 */
export function useIndicadorDeslizante(
  enlaces: RefObject<(HTMLElement | null)[]>,
  indicador: RefObject<HTMLElement | null>,
  indice: number,
) {
  useLayoutEffect(() => {
    const elemento = indicador.current;
    if (!elemento) return;

    const ubicar = () => {
      const enlace = enlaces.current[indice];
      if (!enlace) return;
      elemento.style.setProperty("--x", `${enlace.offsetLeft}px`);
      elemento.style.setProperty("--w", `${enlace.offsetWidth}px`);
    };

    ubicar();
    const cuadro = requestAnimationFrame(() => {
      elemento.dataset.listo = "true";
    });

    // Cambiar la fuente del tema o el tamaño de la pantalla mueve los enlaces
    const observador = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(ubicar);
    if (elemento.parentElement) observador?.observe(elemento.parentElement);

    return () => {
      cancelAnimationFrame(cuadro);
      observador?.disconnect();
    };
  }, [enlaces, indicador, indice]);
}
