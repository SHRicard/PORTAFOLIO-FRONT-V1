/** Tipos del blog. Fuente: docs/api/BLOG.md */

export type EstadoEntrada = "borrador" | "publicado";

/** url null = todavía no se subió. El público nunca las recibe */
export interface ImagenEntrada {
  url: string | null;
  alt: string;
}

export interface DocumentoEntrada {
  url: string | null;
  titulo: string;
}

export interface Entrada {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  /** Párrafos separados por una línea en blanco. Es texto: nunca HTML */
  contenido: string;
  portada: ImagenEntrada | null;
  galeria: ImagenEntrada[];
  documentos: DocumentoEntrada[];
  etiquetas: string[];
  estado: EstadoEntrada;
  /** La primera publicación. null = todavía no se publicó */
  publicadoEn: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Los listados no traen `contenido`: se pide al abrir cada entrada */
export type EntradaResumen = Omit<Entrada, "contenido">;

export interface CrearEntradaInput {
  titulo: string;
  /** Sin slug: el backend lo arma desde el título */
  slug?: string;
  resumen: string;
  contenido: string;
  portada?: ImagenEntrada | null;
  galeria?: ImagenEntrada[];
  documentos?: DocumentoEntrada[];
  etiquetas?: string[];
  estado?: EstadoEntrada;
}

export type ActualizarEntradaInput = Partial<CrearEntradaInput>;
