/** Tipos del panel para proyectos. Fuente: docs/api/PROYECTOS.md */

export type TipoProyecto = "personal" | "freelance" | "empresa";
export type EstadoProyecto = "borrador" | "publicado" | "privado";

/** url null = todavía no se subió o no se tiene */
export interface Imagen {
  url: string | null;
  alt: string;
}

export interface Documento {
  url: string | null;
  titulo: string;
}

/** Un link del proyecto: el código en GitHub, el Release con el APK de prueba... */
export interface Repositorio {
  nombre: string;
  url: string;
}

/** Tal cual está guardado: lo que ve el panel */
export interface Proyecto {
  id: string;
  titulo: string;
  slug: string;
  tipo: TipoProyecto;
  rol: string;
  fecha: string;
  resumen: string;
  descripcion: string;
  tecnologias: string[];
  repositorios: Repositorio[];
  /** La primera imagen es la portada */
  galeria: Imagen[];
  documentos: Documento[];
  destacado: boolean;
  estado: EstadoProyecto;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrearProyectoInput {
  titulo: string;
  /** Sin slug: el backend lo arma desde el título */
  slug?: string;
  tipo: TipoProyecto;
  rol: string;
  fecha: string;
  resumen: string;
  descripcion: string;
  tecnologias?: string[];
  repositorios?: Repositorio[];
  /** La primera imagen es la portada */
  galeria?: Imagen[];
  documentos?: Documento[];
  destacado?: boolean;
  estado?: EstadoProyecto;
  /** Sin orden: va al final */
  orden?: number;
}

export type ActualizarProyectoInput = Partial<CrearProyectoInput>;

/**
 * Qué pasó con el archivo de una foto eliminada (DELETE /proyectos/:id/galeria):
 * "borrado" = se borró de Cloudinary · "en-uso" = otra parte del portafolio la usa, no se tocó · "externo" = no era de Cloudinary
 */
export type ResultadoArchivo = "borrado" | "en-uso" | "externo";

export interface ImagenEliminada {
  /** El proyecto ya sin la foto (vista del panel) */
  proyecto: Proyecto;
  archivo: ResultadoArchivo;
}
