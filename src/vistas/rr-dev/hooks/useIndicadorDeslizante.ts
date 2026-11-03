import { useLayoutEffect, useRef, type RefObject } from "react";
import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/** Lo que tarda la cabeza en llegar y cómo frena: lo mismo que `.indicador-cometa` en estilos.css */
const VUELO = { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" };

/** De dónde a dónde va la estela, en píxeles desde el borde izquierdo del menú */
export function tramo(desde: number, hasta: number) {
  return {
    izquierda: Math.min(desde, hasta),
    largo: Math.abs(hasta - desde),
    sentido: hasta < desde ? "izquierda" : "derecha",
  };
}

/**
 * Deja la estela de `desde` a `hasta`: el frente sigue a la cabeza y, apenas sale, la parte de
 * atrás se empieza a apagar, como la cola de un cometa. Sin movimiento no hay estela.
 */
function dejarEstela(estela: HTMLElement, desde: number, hasta: number) {
  if (typeof estela.animate !== "function" || prefiereMenosMovimiento()) return;
  const { izquierda, largo, sentido } = tramo(desde, hasta);
  estela.getAnimations().forEach((animacion) => animacion.cancel());
  estela.style.setProperty("--desde", `${izquierda}px`);
  estela.style.setProperty("--largo", `${largo}px`);
  estela.dataset.sentido = sentido;

  estela.animate([{ "--frente": "0%" }, { "--frente": "100%" }], { ...VUELO, fill: "both" });
  estela.animate([{ "--atras": "0%" }, { "--atras": "100%" }], {
    duration: 750,
    delay: 200,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    fill: "both",
  });
  estela.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 950, fill: "forwards" });
}

/**
 * Lleva el indicador hasta `enlaces[indice]` escribiendo --x y --w, sin volver a renderizar.
 * Después de ubicarlo la primera vez activa `data-listo`, para que el CSS recién ahí
 * habilite la animación y el indicador no entre volando al cargar la página. Si hay `estela`,
 * al pasar de un enlace a otro la deja entre los dos.
 */
export function useIndicadorDeslizante(
  enlaces: RefObject<(HTMLElement | null)[]>,
  indicador: RefObject<HTMLElement | null>,
  indice: number,
  estela?: RefObject<HTMLElement | null>,
) {
  // El centro del enlace de antes: de ahí sale la estela
  const anterior = useRef<{ indice: number; centro: number } | null>(null);

  useLayoutEffect(() => {
    const elemento = indicador.current;
    if (!elemento) return;

    const ubicar = () => {
      const enlace = enlaces.current[indice];
      if (!enlace) {
        anterior.current = null;
        return;
      }
      elemento.style.setProperty("--x", `${enlace.offsetLeft}px`);
      elemento.style.setProperty("--w", `${enlace.offsetWidth}px`);
      anterior.current = { indice, centro: enlace.offsetLeft + enlace.offsetWidth / 2 };
    };

    const antes = anterior.current;
    ubicar();
    const ahora = anterior.current;
    // Solo entre dos enlaces: si antes no había ninguno marcado, el cometa estaba escondido
    if (elemento.dataset.listo === "true" && antes && ahora && antes.indice !== ahora.indice && estela?.current) {
      dejarEstela(estela.current, antes.centro, ahora.centro);
    }
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
  }, [enlaces, indicador, indice, estela]);
}
