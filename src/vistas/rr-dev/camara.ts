import { JUPITER, MARTE, MERCURIO, SATURNO, TIERRA, VENUS } from "@/vistas/rr-dev/astros";
import type { Astro } from "@/vistas/rr-dev/rotacion";

/**
 * La cámara del espacio de fondo: miramos al sol y en cada apartado nos alejamos un paso, hasta el
 * planeta siguiente. El paso es un número: 0 en Inicio (desde Mercurio), 1 en Sobre mí (desde
 * Venus)... hasta 5 en el blog (desde Saturno), y entre apartados la cámara pasa por todos los
 * valores del medio.
 */
export const PASOS: Record<string, number> = {
  "/": 0,
  "/sobre-mi": 1,
  "/habilidades": 2,
  "/proyectos": 3,
  "/contacto": 4,
  "/blog": 5,
};

/**
 * El paso de la ruta `pathname`, o nada si ese apartado no tiene espacio de fondo. Una publicación se ve
 * desde el blog, y un proyecto (`/proyectos/:slug`), desde Proyectos
 */
export function pasoDe(pathname: string): number | undefined {
  const ruta = pathname.replace(/\/+$/, "") || "/";
  const apartado = /^\/(blog|proyectos)\/./.exec(ruta)?.[1];
  return PASOS[apartado ? `/${apartado}` : ruta];
}

export interface Planeta {
  astro: Astro;
  /** La de estilos.css, con el ángulo de donde le viene la luz en sus fotogramas */
  clase: string;
  /** Un paso atrás va en otro lugar: más cerca que uno común, por ejemplo, para que se vea su Luna */
  unPasoAtras?: { lejania: number; tamano: number };
  /** Antes de llegar, detrás de la cámara, va más lejos que uno común: con anillos, por ejemplo, para que no asomen */
  unPasoAntes?: { lejania: number };
}

/** En el orden en que se alejan del sol: el de cada paso es el que se ve de cerca */
export const PLANETAS: Planeta[] = [
  { astro: MERCURIO, clase: "mercurio" },
  { astro: VENUS, clase: "venus" },
  // Con su Luna, más cerca que un paso atrás común: así se los ve a los dos
  { astro: TIERRA, clase: "tierra", unPasoAtras: { lejania: 0.45, tamano: 0.8 } },
  { astro: MARTE, clase: "marte" },
  { astro: JUPITER, clase: "jupiter" },
  // El último. Sus anillos miden casi tres veces el disco: un paso antes tiene que estar más lejos
  // detrás de la cámara para no asomar
  { astro: SATURNO, clase: "saturno", unPasoAntes: { lejania: 3 } },
];

/** Lo que se achica el sol en cada paso */
export const escalaSol = (paso: number) => 0.75 ** paso;

/**
 * Dónde queda un planeta según cuántos pasos quedó atrás (`ATRAS`). En -1 todavía no llegamos: está
 * detrás nuestro, más grande y fuera de la pantalla, abajo a la izquierda. En 0 es el de cerca, y
 * de ahí en adelante queda entre nosotros y el sol. `LEJANIA` es qué parte del camino entre el sol y
 * el lugar del planeta de cerca le falta recorrer hasta el sol: 1 de cerca, cada vez menos al
 * alejarse. `TAMANO` es el diámetro sobre el ancho que tiene el sol en ese paso: un poco menos que
 * su disco, para que ningún planeta del fondo se vea más grande que el sol.
 */
const ATRAS = [-1, 0, 1, 2, 3, 4, 5];
const LEJANIA = [1.9, 1, 0.28, 0.14, 0.09, 0.07, 0.055];
const TAMANO = [0.52, 0.36, 0.26, 0.19, 0.15];
/** De cerca, y detrás nuestro: sobre el diámetro del planeta de cerca */
const TAMANO_CERCA = [2.6, 1];

/**
 * Entre los puntos de una tabla, una curva que pasa por todos sin pasarse ni ondular, y sin quiebres
 * de velocidad al cruzarlos (Fritsch-Carlson). Así un salto de varios pasos se ve como un solo
 * movimiento. Los `xs` van de a 1; fuera de la tabla, se queda en la punta.
 */
export function curva(xs: number[], ys: number[], x: number) {
  const ultimo = xs.length - 1;
  const dentro = Math.min(Math.max(x, xs[0]!), xs[ultimo]!);
  const subidas = ys.slice(1).map((y, i) => y - ys[i]!);
  const tangente = (i: number) => {
    if (i === 0) return subidas[0]!;
    if (i === ultimo) return subidas[ultimo - 1]!;
    const [antes, despues] = [subidas[i - 1]!, subidas[i]!];
    return antes * despues <= 0 ? 0 : 2 / (1 / antes + 1 / despues);
  };
  const i = Math.min(Math.floor(dentro - xs[0]!), ultimo - 1);
  const t = dentro - xs[i]!;
  return (
    (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i]! +
    (t ** 3 - 2 * t ** 2 + t) * tangente(i) +
    (-2 * t ** 3 + 3 * t ** 2) * ys[i + 1]! +
    (t ** 3 - t ** 2) * tangente(i + 1)
  );
}

/** Lo que hace falta de la pantalla: su ancho y su alto, y el centro del sol */
export interface Medidas {
  ancho: number;
  alto: number;
  solX: number;
  solY: number;
}

/** Las mismas medidas que antes estaban en CSS: el planeta de cerca y el ancho del sol en Inicio */
const deCerca = (ancho: number, alto: number) => {
  const diametro = Math.min(Math.max(420, ancho * 0.46), 860);
  return { diametro, x: ancho * 0.12, y: alto + diametro * 0.05 };
};
const anchoDelSol = (ancho: number) => Math.min(Math.max(150, ancho * 0.15), 300);

/**
 * Dónde se ve el planeta `numero` con la cámara en `paso`: su centro y su diámetro, en píxeles.
 * Va en la línea que une el planeta de cerca con el sol. El tamaño y lo que le falta hasta el sol
 * cambian de a veces, como en una perspectiva, siguiendo la curva de la tabla.
 */
export function ubicacion(numero: number, paso: number, { ancho, alto, solX, solY }: Medidas) {
  const cerca = deCerca(ancho, alto);
  const sol = anchoDelSol(ancho);
  const { unPasoAtras: especial, unPasoAntes: antes } = PLANETAS[numero] ?? {};
  const lejanias = LEJANIA.map((lejania, i) => {
    if (especial && ATRAS[i] === 1) return especial.lejania;
    return antes && ATRAS[i] === -1 ? antes.lejania : lejania;
  });
  const diametros = ATRAS.map((atras, i) => {
    if (atras < 1) return cerca.diametro * TAMANO_CERCA[i]!;
    const tamano = especial && atras === 1 ? especial.tamano : TAMANO[atras - 1]!;
    return sol * escalaSol(numero + atras) * tamano;
  });

  const atras = paso - numero;
  const lejania = Math.exp(curva(ATRAS, lejanias.map(Math.log), atras));
  return {
    x: solX + (cerca.x - solX) * lejania,
    y: solY + (cerca.y - solY) * lejania,
    diametro: Math.exp(curva(ATRAS, diametros.map(Math.log), atras)),
  };
}

/** Se dibuja desde que está por entrar, todavía fuera de la pantalla */
export const seDibuja = (numero: number, paso: number) => paso - numero > -1;

/** Segundos que tarda la cámara en ir de un apartado a otro: 1.6 por un paso, y medio más por cada paso de más */
export const duracion = (desde: number, hasta: number) => 1.1 + 0.5 * Math.abs(hasta - desde);

/** Arranca despacio, toma velocidad y frena despacio: como una cámara de verdad */
export const suavizar = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
