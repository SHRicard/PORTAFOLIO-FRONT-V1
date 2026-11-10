import { type RefObject, useEffect } from "react";

/** Un disco en la pantalla: su centro y su radio, en píxeles */
export interface Disco {
  x: number;
  y: number;
  radio: number;
}

/** Puntos de la caja que se prueban: una grilla de 10 × 6 */
const COLUMNAS = 10;
const FILAS = 6;
/** Con una décima parte de la caja encima del disco ya lleva el vidrio */
const MINIMO = (COLUMNAS * FILAS) / 10;
/** Una caja que pasa a menos de estos radios del centro tapa el disco, aunque sea chico */
const CERCA_DEL_CENTRO = 0.7;
/** Cuadros quietos que espera antes de dejar de medir: lo que dura el encendido de las piezas */
const QUIETO = 240;

/**
 * La caja tapa el disco: por lo menos una décima parte de sus puntos cae adentro, o pasa cerca del
 * centro del disco (a menos de 0.7 radios), como un texto largo encima de un planeta chico
 */
export function tapa(caja: Pick<DOMRect, "left" | "top" | "width" | "height">, disco: Disco): boolean {
  let adentro = 0;
  for (let i = 0; i < COLUMNAS; i++) {
    for (let j = 0; j < FILAS; j++) {
      const x = caja.left + ((i + 0.5) / COLUMNAS) * caja.width;
      const y = caja.top + ((j + 0.5) / FILAS) * caja.height;
      if ((x - disco.x) ** 2 + (y - disco.y) ** 2 < disco.radio ** 2) adentro++;
    }
  }
  if (adentro >= MINIMO) return true;
  // El punto de la caja más cercano al centro del disco
  const x = Math.min(Math.max(disco.x, caja.left), caja.left + caja.width);
  const y = Math.min(Math.max(disco.y, caja.top), caja.top + caja.height);
  return (x - disco.x) ** 2 + (y - disco.y) ** 2 < (disco.radio * CERCA_DEL_CENTRO) ** 2;
}

/** El disco del planeta del espacio de fondo, del lugar donde lo puso la cámara (ver `SpaceScene`) */
function discoDe(clase: string): Disco | null {
  const astro = document.querySelector<HTMLElement>(`.escena .astro.${clase}`);
  if (!astro) return null;
  const [x, y, diametro] = ["--x", "--y", "--diametro"].map((nombre) =>
    parseFloat(astro.style.getPropertyValue(nombre)),
  );
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(diametro)
    ? { x: x!, y: y!, radio: diametro! / 2 }
    : null;
}

/**
 * Marca con `data-sobre-planeta` las piezas con `data-respaldo` que caen encima de un planeta del
 * fondo (el `.astro` con alguna de las `clases`): el texto blanco no se lee sobre un planeta claro, y
 * así se apoya en un vidrio oscuro (estilos.css). Mide mientras la cámara viaja y las piezas se
 * encienden, y de nuevo si cambia la pantalla, el contenido o se abre algo (`aria-expanded`)
 */
export function useSobrePlaneta(raiz: RefObject<HTMLElement | null>, clases: string | readonly string[]) {
  // Un texto y no la lista: así una lista nueva con los mismos planetas no vuelve a empezar
  const planetas = typeof clases === "string" ? clases : clases.join(" ");

  useEffect(() => {
    const contenedor = raiz.current;
    if (!contenedor || typeof requestAnimationFrame === "undefined") return;
    let cuadro = 0;
    let quieto = 0;
    let antes = "";

    const marcar = () => {
      const discos = planetas
        .split(" ")
        .map(discoDe)
        .filter((disco): disco is Disco => disco !== null);
      contenedor.querySelectorAll<HTMLElement>("[data-respaldo]").forEach((pieza) => {
        const caja = pieza.getBoundingClientRect();
        pieza.toggleAttribute(
          "data-sobre-planeta",
          discos.some((disco) => tapa(caja, disco)),
        );
      });
      return discos.map(({ x, y, radio }) => `${x},${y},${radio}`).join(" ");
    };

    const mirar = () => {
      const ahora = marcar();
      quieto = ahora === antes ? quieto + 1 : 0;
      antes = ahora;
      cuadro = quieto < QUIETO ? requestAnimationFrame(mirar) : 0;
    };

    const despertar = () => {
      quieto = 0;
      if (!cuadro) cuadro = requestAnimationFrame(mirar);
    };

    despertar();
    addEventListener("resize", despertar);
    const observador = new MutationObserver(despertar);
    // `aria-expanded`: al abrirse una ficha de Proyectos, las de abajo se corren
    observador.observe(contenedor, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ["aria-expanded"],
    });
    return () => {
      cancelAnimationFrame(cuadro);
      removeEventListener("resize", despertar);
      observador.disconnect();
    };
  }, [raiz, planetas]);
}
