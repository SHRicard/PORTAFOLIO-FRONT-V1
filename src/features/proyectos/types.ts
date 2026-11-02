/** Tipos del panel para proyectos. Fuente: docs/api/PROYECTOS.md */

export type TipoProyecto = "personal" | "freelance" | "empresa";
export type EstadoProyecto = "borrador" | "publicado" | "privado";
export type TiendaApp = "playStore" | "appStore";

/** url null = todavía no se subió o no se tiene */
export interface Imagen {
  url: string | null;
  alt: string;
}

export interface Documento {
  url: string | null;
  titulo: string;
}

export interface Repositorio {
  nombre: string;
  url: string;
}

export interface Tienda {
  tienda: TiendaApp;
  app: string;
  url: string | null;
}

export interface ApkDemo {
  url: string | null;
  nota: string;
}

export interface Enlaces {
  demo: string | null;
  demoPorSolicitud: boolean;
  repositorios: Repositorio[];
  tiendas: Tienda[];
  apkDemo: ApkDemo | null;
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
  enlaces: Enlaces;
  portada: Imagen | null;
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
  enlaces?: Enlaces;
  portada?: Imagen | null;
  galeria?: Imagen[];
  documentos?: Documento[];
  destacado?: boolean;
  estado?: EstadoProyecto;
  /** Sin orden: va al final */
  orden?: number;
}

export type ActualizarProyectoInput = Partial<CrearProyectoInput>;
