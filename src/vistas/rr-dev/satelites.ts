import moderno from "@/vistas/rr-dev/assets/satelites/moderno.webp";
import telescopio from "@/vistas/rr-dev/assets/satelites/telescopio.webp";
import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/**
 * Un satélite en órbita baja alrededor de la Tierra. Está estabilizado en tres ejes: no gira sobre
 * sí mismo, sino que mantiene las antenas mirando al centro de la Tierra, así que da una sola vuelta
 * lenta por órbita, como la Luna.
 */
export interface Satelite {
  tipo: keyof typeof IMAGENES;
  /** Ancho de la imagen sobre el diámetro de la Tierra */
  ancho: number;
  /** Radio de la órbita sobre el radio de la Tierra */
  orbita: number;
  /** Cuánto se aplasta la órbita al verla: 1 es un círculo de frente y 0, una línea de canto */
  aplastada: number;
  /** Cuánto se gira su órbita en la pantalla, en grados: cada satélite tiene su plano */
  plano: number;
  /** Segundos que tarda en dar una vuelta a la Tierra */
  vuelta: number;
  /**
   * En qué grado de la órbita arranca. Detrás de la Tierra, tapado entero por ella, poco antes de
   * asomar por su borde: así al entrar a la página no aparecen de golpe. Cada uno sale en otro momento
   */
  fase: number;
}

export const IMAGENES = { moderno, telescopio };

/**
 * Hacia dónde apuntan las antenas en cada imagen, en grados: 0 es a la derecha y 90, abajo. Se
 * ajustan mirando el resultado. El telescopio mira a la Tierra con su panza: así pasa acostado
 * sobre el horizonte
 */
const ANTENAS: Record<Satelite["tipo"], number> = { moderno: 135, telescopio: 90 };

/** Lo que se achica el satélite en la parte de la órbita más alejada de nosotros */
const ESCALA_DETRAS = 0.94;

/**
 * De cerca, en Habilidades: chicos y en órbita baja. Salen de detrás de la Tierra por arriba y se
 * deslizan sobre su borde iluminado, contra el negro del espacio, hacia el sol: el moderno asoma a
 * los 2.5 segundos de entrar y el telescopio a los 14, cuando el otro ya se alejó, para que no se
 * encimen. Vuelven a pasar por delante de la Tierra fuera de la pantalla. El de más afuera tarda
 * más en dar la vuelta.
 */
export const SATELITES_CERCA: Satelite[] = [
  { tipo: "moderno", ancho: 0.075, orbita: 1.1, aplastada: 0.8, plano: 130, vuelta: 100, fase: 250 },
  { tipo: "telescopio", ancho: 0.06, orbita: 1.18, aplastada: 0.75, plano: 150, vuelta: 140, fase: 280 },
];

/**
 * De lejos, desde Proyectos, con la Tierra atrás. A escala serían puntos de 4px pegados al borde: se
 * muestran más grandes y más afuera, con las órbitas más inclinadas para que se los vea pasar por
 * delante de la Tierra y esconderse detrás. Son los mismos satélites que de cerca: tardan lo mismo,
 * van en el mismo plano y arrancan en el mismo lugar, así al alejarse la cámara no saltan.
 */
export const SATELITES_LEJOS: Satelite[] = [
  { tipo: "moderno", ancho: 0.22, orbita: 1.4, aplastada: 0.4, plano: 130, vuelta: 100, fase: 250 },
  { tipo: "telescopio", ancho: 0.17, orbita: 1.7, aplastada: 0.35, plano: 150, vuelta: 140, fase: 280 },
];

const entre = (cerca: number, lejos: number, lejania: number) => cerca + (lejos - cerca) * lejania;

/** Los satélites con la cámara en `lejania`: 0 con la Tierra de cerca, 1 un paso después, y lo del medio */
export const mezclar = (lejania: number): Satelite[] =>
  SATELITES_CERCA.map((cerca, numero) => {
    const lejos = SATELITES_LEJOS[numero] ?? cerca;
    return {
      ...cerca,
      ancho: entre(cerca.ancho, lejos.ancho, lejania),
      orbita: entre(cerca.orbita, lejos.orbita, lejania),
      aplastada: entre(cerca.aplastada, lejos.aplastada, lejania),
      plano: entre(cerca.plano, lejos.plano, lejania),
      fase: entre(cerca.fase, lejos.fase, lejania),
    };
  });

/**
 * Los segundos en que `satelite` está en la punta de su órbita, del todo afuera de la Tierra: ahí
 * queda quieto si el sistema pide menos movimiento, porque donde arranca lo tapa la Tierra.
 */
export const afuera = ({ fase, vuelta }: Satelite) => ((fase - 180) / 360) * vuelta;

/**
 * Dónde está `satelite` a los `segundos`, en píxeles desde el centro de la Tierra, que tiene un
 * radio de `radio` píxeles y ve al sol en el ángulo `haciaElSol` (en radianes). La órbita es un
 * círculo inclinado: la mitad de arriba pasa por delante de la Tierra y la de abajo, por detrás.
 * Por arriba van de izquierda a derecha, hacia el sol. Está en la sombra cuando queda del lado
 * opuesto al sol, dentro del cilindro que tapa la Tierra.
 */
export function enOrbita(satelite: Satelite, segundos: number, radio: number, haciaElSol: number) {
  const angulo = (satelite.fase / 360 - segundos / satelite.vuelta) * Math.PI * 2;
  const distancia = satelite.orbita * radio;
  const ancho = distancia * Math.cos(angulo);
  const alto = -distancia * Math.sin(angulo) * satelite.aplastada;
  const plano = (satelite.plano * Math.PI) / 180;
  const x = ancho * Math.cos(plano) - alto * Math.sin(plano);
  const y = ancho * Math.sin(plano) + alto * Math.cos(plano);
  const haciaElSolDesdeLaTierra = x * Math.cos(haciaElSol) + y * Math.sin(haciaElSol);

  return {
    x,
    y,
    adelante: Math.sin(angulo) > 0,
    escala: ESCALA_DETRAS + ((1 - ESCALA_DETRAS) * (1 + Math.sin(angulo))) / 2,
    // Las antenas, siempre hacia el centro de la Tierra
    giro: (Math.atan2(-y, -x) * 180) / Math.PI - ANTENAS[satelite.tipo],
    enSombra: haciaElSolDesdeLaTierra < 0 && distancia ** 2 - haciaElSolDesdeLaTierra ** 2 < radio ** 2,
  };
}

const centro = (elemento: Element) => {
  const { left, top, width, height } = elemento.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
};

/**
 * Mueve los satélites de `capa`, que son sus hijos en el orden de `SATELITES_CERCA`. La capa ocupa
 * la caja de la Tierra, que mide su diámetro / 0.86. `lejania` dice en cada cuadro qué tan lejos
 * está la cámara (ver `mezclar`). Si el sistema pide menos movimiento, quedan quietos afuera de la
 * Tierra. Devuelve la función que los detiene.
 */
export function orbitarSatelites(capa: HTMLElement, lejania: () => number): () => void {
  const imagenes = [...capa.children] as HTMLImageElement[];
  let radio = 0;
  let haciaElSol = 0;

  // En cada cuadro: cuando la cámara se aleja o se acerca, la Tierra cambia de tamaño y de lugar
  const medir = () => {
    radio = (capa.offsetWidth * 0.86) / 2;
    const sol = capa.closest(".escena")?.querySelector(".sol");
    if (!sol) return;
    const tierra = centro(capa);
    const { x, y } = centro(sol);
    haciaElSol = Math.atan2(y - tierra.y, x - tierra.x);
  };

  const ubicar = (momento: (satelite: Satelite) => number) => {
    medir();
    mezclar(lejania()).forEach((satelite, numero) => {
      const imagen = imagenes[numero];
      if (!imagen) return;
      const { x, y, adelante, escala, giro, enSombra } = enOrbita(satelite, momento(satelite), radio, haciaElSol);
      imagen.style.setProperty("--ancho-satelite", String(satelite.ancho));
      imagen.style.transform = `translate(${x}px, ${y}px) rotate(${giro}deg) scale(${escala})`;
      imagen.classList.toggle("detras", !adelante);
      imagen.classList.toggle("en-sombra", enSombra);
    });
  };

  // Sin movimiento, la cámara salta de un apartado al otro: la Tierra cambia de tamaño, igual que si
  // cambia la pantalla, y ahí se reubican
  if (prefiereMenosMovimiento()) {
    ubicar(afuera);
    if (typeof ResizeObserver === "undefined") return () => undefined;
    const observador = new ResizeObserver(() => ubicar(afuera));
    observador.observe(capa);
    return () => observador.disconnect();
  }

  // Ya en su lugar antes de que se vean: detrás de la Tierra
  ubicar(() => 0);
  let inicio: number | undefined;
  let cuadro = 0;
  const animar = (ahora: number) => {
    cuadro = requestAnimationFrame(animar);
    // Esperan escondidos hasta que bajen sus imágenes: si salieran antes, aparecerían de golpe
    if (imagenes.every((imagen) => imagen.complete)) inicio ??= ahora;
    const segundos = inicio === undefined ? 0 : (ahora - inicio) / 1000;
    ubicar(() => segundos);
  };
  cuadro = requestAnimationFrame(animar);

  return () => cancelAnimationFrame(cuadro);
}
