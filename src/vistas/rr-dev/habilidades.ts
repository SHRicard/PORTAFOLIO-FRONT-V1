import { Database, type LucideIcon, Monitor, Palette, Server, Smartphone, Sparkles, Wrench } from "lucide-react";
import { agruparPor, CATEGORIA } from "@/features/portafolio/formato";
import type { CategoriaHabilidad, Perfil } from "@/features/portafolio/types";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

export type Habilidad = Perfil["habilidades"][number];

/** Los colores de las áreas: los de StatsBar, y un gris para las herramientas y las otras */
export type TonoArea = TonoEstadistica | "neutro";

/** Las habilidades de una categoría, con lo que hace falta para dibujar su constelación */
export interface AreaHabilidades {
  categoria: CategoriaHabilidad;
  /** El nombre que tiene en el panel: Front-end, Back-end... */
  nombre: string;
  tono: TonoArea;
  /** Va en la burbuja de una habilidad sin logo */
  icono: LucideIcon;
  habilidades: string[];
}

const ESTILO_AREA: Record<CategoriaHabilidad, Pick<AreaHabilidades, "tono" | "icono">> = {
  front: { tono: "info", icono: Monitor },
  back: { tono: "exito", icono: Server },
  mobile: { tono: "rosa", icono: Smartphone },
  "base-de-datos": { tono: "aviso", icono: Database },
  diseno: { tono: "rosa", icono: Palette },
  herramientas: { tono: "neutro", icono: Wrench },
  otra: { tono: "neutro", icono: Sparkles },
};

/**
 * Las habilidades del perfil agrupadas por categoría, de la que tiene más a la que tiene menos. Las
 * que tienen las mismas quedan en el orden en que llegan, y dentro de cada una, también
 */
export function armarAreas(habilidades: Habilidad[]): AreaHabilidades[] {
  return agruparPor(habilidades, ({ categoria }) => categoria)
    .map(([categoria, delArea]) => ({
      categoria,
      nombre: CATEGORIA[categoria],
      ...ESTILO_AREA[categoria],
      habilidades: delArea.map(({ nombre }) => nombre),
    }))
    .sort((a, b) => b.habilidades.length - a.habilidades.length);
}

export type Lado = "izquierda" | "derecha";

/**
 * Dónde va cada área, de la que tiene más a la que tiene menos: su costado y su columna (0 es la que
 * da al texto). Las dos más grandes van pegadas al texto, una de cada lado. A la derecha hay más alto
 * (la izquierda termina antes de la Tierra): su columna de afuera lleva dos
 */
const LUGARES: [Lado, number][] = [
  ["izquierda", 0],
  ["derecha", 0],
  ["derecha", 1],
  ["izquierda", 1],
  ["derecha", 1],
  ["izquierda", 1],
  ["derecha", 0],
];

/** Las columnas de cada costado, de la que da al texto hacia afuera. Sin áreas, sin columnas */
export function repartirColumnas(areas: AreaHabilidades[]): Record<Lado, AreaHabilidades[][]> {
  const costados: Record<Lado, AreaHabilidades[][]> = { izquierda: [[], []], derecha: [[], []] };
  areas.forEach((area, orden) => {
    const [lado, columna] = LUGARES[orden] ?? LUGARES[LUGARES.length - 1]!;
    costados[lado][columna]!.push(area);
  });
  return {
    izquierda: costados.izquierda.filter((columna) => columna.length > 0),
    derecha: costados.derecha.filter((columna) => columna.length > 0),
  };
}

/** Las dos medidas de las constelaciones: grande en una pantalla alta y chica en una baja, como una laptop */
type Tamano = "grande" | "chica";
/** El alto del nombre de un área, arriba de sus burbujas, en px */
export const ROTULO: Record<Tamano, number> = { grande: 26, chica: 20 };
/** El hueco entre dos constelaciones de una columna, en px */
export const ENTRE: Record<Tamano, number> = { grande: 28, chica: 16 };
/** La distancia más grande entre dos burbujas de una constelación, en px */
export const PASO_MAXIMO = 84;
/** Desde esta distancia las burbujas van grandes */
const PASO_GRANDE = 50;

export const tamanoPara = (paso: number): Tamano => (paso >= PASO_GRANDE ? "grande" : "chica");

/**
 * La distancia entre dos burbujas de un costado, en px: la más grande con la que entran todas sus
 * columnas en `alto`. Es la misma en todas, así las burbujas de un costado quedan en filas
 */
export function pasoParejo(alto: number, columnas: AreaHabilidades[][]): number {
  const conTamano = (tamano: Tamano) =>
    Math.min(
      PASO_MAXIMO,
      ...columnas.map((columna) => {
        const burbujas = columna.reduce((suma, area) => suma + area.habilidades.length, 0);
        const fijo = columna.length * ROTULO[tamano] + (columna.length - 1) * ENTRE[tamano];
        return (alto - fijo) / burbujas;
      }),
    );
  const grande = conTamano("grande");
  return Math.max(0, grande >= PASO_GRANDE ? grande : Math.min(conTamano("chica"), PASO_GRANDE - 1));
}

/**
 * Las medidas de una constelación según la distancia entre sus burbujas, en px: la burbuja (deja aire
 * entre una y otra), lo que se arquea y el hueco hasta el nombre
 */
export function medidasPara(paso: number) {
  const tamano = tamanoPara(paso);
  const burbuja = Math.round(Math.min(46, Math.max(24, paso - 12)));
  return { tamano, burbuja, curva: Math.round(burbuja * 0.9), hueco: tamano === "grande" ? 12 : 8 };
}
