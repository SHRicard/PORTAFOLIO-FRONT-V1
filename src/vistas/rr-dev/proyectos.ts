import type { Proyecto, TipoProyecto } from "@/features/portafolio/types";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";
import { type Logo, logoTecnologia } from "@/vistas/rr-dev/logos";

/** Cuántas fichas entran a cada lado de la Tierra. Sin `derecha`, van todas en una sola lista */
export interface LugaresProyectos {
  izquierda: number;
  derecha: number;
}

/**
 * Cuántas fichas entran en una pantalla: vale la primera consulta que se cumple. Desde `xl` en una
 * pantalla alta, 4 a la izquierda, arriba de Marte, y 6 a la derecha, debajo del sol. En una laptop y
 * en una tableta, 4 y 4. En el celular, una sola lista de 4, o de 3 si es bajo
 */
export const LUGARES_PROYECTOS: (LugaresProyectos & { consulta: string | null })[] = [
  { consulta: "(min-width: 80rem) and (min-height: 50rem)", izquierda: 4, derecha: 6 },
  { consulta: "(min-width: 48rem)", izquierda: 4, derecha: 4 },
  { consulta: "(min-height: 43.75rem)", izquierda: 4, derecha: 0 },
  { consulta: null, izquierda: 3, derecha: 0 },
];

export const porPaginaDe = ({ izquierda, derecha }: LugaresProyectos) => izquierda + derecha;

/**
 * Reparte los proyectos de una página entre los costados, mitad y mitad como antes: con dos, uno de
 * cada lado. La izquierda va primero y tiene menos lugar (Marte); lo que no entra va a la derecha.
 * Con un solo costado, todos en la izquierda
 */
export function repartirProyectos<T>(lista: T[], { izquierda, derecha }: LugaresProyectos) {
  const cuantos = derecha === 0 ? lista.length : Math.min(izquierda, Math.ceil(lista.length / 2));
  return { izquierda: lista.slice(0, cuantos), derecha: lista.slice(cuantos) };
}

/** Las tecnologías con logo que se ven en la fila de un proyecto: las demás van en «+N» */
export const TECNOLOGIAS_A_LA_VISTA = 6;

/** Cada proyecto tiene un color, los de StatsBar, en el orden del panel */
const TONOS: TonoEstadistica[] = ["info", "exito", "aviso", "rosa"];

export const tonoProyecto = (indice: number): TonoEstadistica => TONOS[indice % TONOS.length]!;

/** El tipo, corto, en el renglón de debajo del título: el largo (`TIPO_PROYECTO`) va en el panel */
export const TIPO_CORTO: Record<TipoProyecto, string> = { personal: "Personal", freelance: "Freelance", empresa: "Empresa" };

/** Lo que va en el emblema mientras el proyecto no tenga portada. Vive en formato.ts: el panel también la usa */
export { iniciales } from "@/features/portafolio/formato";

export interface TecnologiaConLogo {
  nombre: string;
  logo: Logo;
}

/**
 * Las tecnologías que tienen logo, en el orden en que vienen y sin repetir el mismo dibujo (React
 * Native y React Native Web llevan el de React), hasta `cuantas`
 */
export function tecnologiasConLogo(tecnologias: string[], cuantas = TECNOLOGIAS_A_LA_VISTA): TecnologiaConLogo[] {
  const vistos = new Set<Logo>();
  const lista: TecnologiaConLogo[] = [];
  for (const nombre of tecnologias) {
    const logo = logoTecnologia(nombre);
    if (!logo || vistos.has(logo)) continue;
    vistos.add(logo);
    lista.push({ nombre, logo });
    if (lista.length === cuantas) break;
  }
  return lista;
}

/** Las tecnologías que no se ven en la fila: las cuenta el «+N» */
export const tecnologiasOcultas = (tecnologias: string[], aLaVista: TecnologiaConLogo[]) =>
  tecnologias.filter((nombre) => !aLaVista.some((tecnologia) => tecnologia.nombre === nombre));

/** La búsqueda de la URL de Proyectos: la página, si no es la primera, y el proyecto abierto */
export function busquedaDeProyectos(pagina: number, ver?: string): string {
  const busqueda = new URLSearchParams();
  if (pagina > 1) busqueda.set("pagina", String(pagina));
  if (ver) busqueda.set("ver", ver);
  const texto = busqueda.toString();
  return texto && `?${texto}`;
}

/** Los proyectos de una página, con su lugar en la lista entera: de él sale su color */
export function proyectosDeLaPagina(proyectos: Proyecto[], pagina: number, porPagina: number) {
  return proyectos
    .map((proyecto, indice) => ({ proyecto, indice }))
    .slice((pagina - 1) * porPagina, pagina * porPagina);
}

export const paginasDeProyectos = (cantidad: number, porPagina: number) =>
  Math.max(1, Math.ceil(cantidad / porPagina));
