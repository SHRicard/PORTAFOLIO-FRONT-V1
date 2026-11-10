import type { DocumentoEntrada, EntradaResumen, ImagenEntrada } from "@/features/blog/types";

/** Las publicaciones de cada página: las que rodean a la del centro, tres de cada lado */
export const POR_PAGINA = 6;

export type ConUrl<T extends { url: string | null }> = T & { url: string };

/**
 * La búsqueda de la URL del blog: la página, si no es la primera, y la publicación abierta.
 * Abrir una publicación no cambia de ruta: el blog queda montado detrás, en la misma página
 */
export function busquedaDelBlog(pagina: number, leer?: string): string {
  const busqueda = new URLSearchParams();
  if (pagina > 1) busqueda.set("pagina", String(pagina));
  if (leer) busqueda.set("leer", leer);
  const texto = busqueda.toString();
  return texto && `?${texto}`;
}

/** La página de `?pagina=`: un entero desde 1. Cualquier otra cosa es la primera */
export function paginaDe(valor: string | null): number {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

/**
 * Los números del paginado: la primera, la última y las vecinas de la actual. Un salto de más de
 * una página se marca con "…"; si salta una sola, va ese número, que ocupa lo mismo que los puntos
 */
export function numerosDePagina(pagina: number, paginas: number): (number | "…")[] {
  const elegidas = [...new Set([1, pagina - 1, pagina, pagina + 1, paginas])]
    .filter((n) => n >= 1 && n <= paginas)
    .sort((a, b) => a - b);
  const lista: (number | "…")[] = [];
  for (const n of elegidas) {
    const anterior = lista.at(-1);
    if (typeof anterior === "number" && n - anterior === 2) lista.push(n - 1);
    if (typeof anterior === "number" && n - anterior > 2) lista.push("…");
    lista.push(n);
  }
  return lista;
}

const tieneUrl = <T extends { url: string | null }>(item: T | null): item is ConUrl<T> => Boolean(item?.url);

/** Las fotos que ya se subieron: la portada primero y después la galería */
export const fotosDe = ({ portada, galeria }: Pick<EntradaResumen, "portada" | "galeria">): ConUrl<ImagenEntrada>[] =>
  [portada, ...galeria].filter(tieneUrl);

/** Los archivos que ya se subieron */
export const documentosDe = (entradas: Pick<EntradaResumen, "documentos">[]): ConUrl<DocumentoEntrada>[] =>
  entradas.flatMap(({ documentos }) => documentos).filter(tieneUrl);

/** Los temas de las publicaciones que se ven, sin repetir (sin importar mayúsculas) y en el orden en que aparecen */
export function temasDe(entradas: Pick<EntradaResumen, "etiquetas">[]): string[] {
  const temas = new Map<string, string>();
  for (const { etiquetas } of entradas) {
    for (const etiqueta of etiquetas) {
      const tema = etiqueta.trim();
      const clave = tema.toLocaleLowerCase("es");
      if (tema && !temas.has(clave)) temas.set(clave, tema);
    }
  }
  return [...temas.values()];
}

/**
 * El título en dos partes, como el nombre de Inicio: la segunda va con el degradado. Si tiene dos
 * puntos, es lo que les sigue; si no, la última palabra. Con una sola palabra, va entera
 */
export function partesDelTitulo(titulo: string): [string, string] {
  const texto = titulo.trim();
  const corte = texto.indexOf(":");
  if (corte > 0 && corte < texto.length - 1) return [texto.slice(0, corte + 1), texto.slice(corte + 1).trim()];
  const espacio = texto.lastIndexOf(" ");
  return espacio > 0 ? [texto.slice(0, espacio), texto.slice(espacio + 1)] : ["", texto];
}

/** "Inteligencia artificial" → "#InteligenciaArtificial", como en las redes */
export const hashtag = (etiqueta: string) =>
  `#${etiqueta
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join("")}`;

/** "https://www.arxiv.org/pdf/1" → "arxiv.org" */
export function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
