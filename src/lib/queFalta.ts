/** "a", "a y b", "a, b y c" */
export function enumerar(partes: string[]): string {
  return partes.length < 2 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`;
}

interface Faltantes {
  /** No tiene portada ni con descripción */
  sinPortada: boolean;
  /** La portada tiene descripción pero todavía no su archivo (`url: null`) */
  portadaSinSubir: boolean;
  /** Fotos de la galería sin archivo */
  fotos: number;
  /** PDF sin archivo */
  pdfs: number;
}

/**
 * Lo que le falta a un proyecto o a una entrada del blog, en una línea (las listas del panel y sus vistas
 * previas), o null si no le falta nada: «Falta la portada», «Falta subir la portada, 6 fotos y el PDF»,
 * «Falta la portada y subir 2 PDF»
 */
export function textoQueFalta({ sinPortada, portadaSinSubir, fotos, pdfs }: Faltantes): string | null {
  const subir = [
    ...(portadaSinSubir ? ["la portada"] : []),
    ...(fotos > 0 ? [fotos === 1 ? "1 foto" : `${fotos} fotos`] : []),
    ...(pdfs > 0 ? [pdfs === 1 ? "el PDF" : `${pdfs} PDF`] : []),
  ];
  if (sinPortada) return subir.length > 0 ? `Falta la portada y subir ${enumerar(subir)}` : "Falta la portada";
  return subir.length > 0 ? `Falta subir ${enumerar(subir)}` : null;
}
