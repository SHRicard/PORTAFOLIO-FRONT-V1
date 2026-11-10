/** Tipos de la lectura pública del portafolio. Fuente: docs/api/IMPLEMENTACION_ME.md y, el contacto, docs/api/PERFIL.md */

export type Modalidad = "remoto" | "hibrido" | "presencial";
export type TipoRed = "github" | "linkedin" | "behance" | "dribbble" | "instagram" | "x" | "youtube" | "sitio" | "otra";
export type CategoriaHabilidad = "front" | "back" | "mobile" | "base-de-datos" | "diseno" | "herramientas" | "otra";
export type NivelIdioma = "basico" | "intermedio" | "avanzado" | "nativo";
export type TipoDatoCurioso = "profesional" | "personal";
export type TipoProyecto = "personal" | "freelance" | "empresa";
export type TipoEstudio = "carrera" | "curso" | "certificacion";

/** Mes en formato AAAA-MM, ej. "2024-07" */
export type FechaMes = string;

export interface Perfil {
  id: string;
  nombreVisible: string;
  rol: string;
  frase: string;
  ubicacion: { ciudad: string; pais: string };
  modalidad: Modalidad;
  disponibilidad: { disponible: boolean; texto: string };
  bioCorta: string;
  /** Párrafos separados por una línea en blanco */
  bioLarga: string;
  /** Siempre viene con todas las claves. Lo vacío ("", [] o null) no se muestra */
  contacto: {
    /** En minúsculas */
    correo: string;
    /** Formato internacional, con + y código de país. null = sin teléfono */
    telefono: { numero: string; whatsapp: boolean } | null;
    redes: { tipo: TipoRed; url: string }[];
    mensaje: string;
    /** Chips "Abierto a" */
    abiertoA: string[];
    tiempoRespuesta: string;
    horario: string;
    /** URL https para agendar una llamada. null = no hay */
    agenda: string | null;
  };
  habilidades: { nombre: string; categoria: CategoriaHabilidad }[];
  idiomas: { idioma: string; nivel: NivelIdioma }[];
  datosCuriosos: { titulo: string; valor: string; tipo: TipoDatoCurioso }[];
  /** null = todavía no se subió */
  foto: { url: string; alt: string } | null;
  cv: { url: string } | null;
  createdAt: string;
  updatedAt: string;
  /** Id (carpeta) del diseño que eligió el administrador, ej. "rr-dev". null = la vista por defecto */
  vista: string | null;
}

export interface Proyecto {
  id: string;
  titulo: string;
  slug: string;
  tipo: TipoProyecto;
  rol: string;
  fecha: FechaMes;
  resumen: string;
  /** Párrafos separados por una línea en blanco */
  descripcion: string;
  tecnologias: string[];
  repositorios: { nombre: string; url: string }[];
  /** Solo las que ya tienen URL. La primera es la portada */
  galeria: { url: string; alt: string }[];
  documentos: { url: string; titulo: string }[];
  destacado: boolean;
  estado: "publicado";
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experiencia {
  id: string;
  empresa: string;
  puesto: string;
  desde: FechaMes;
  /** null = trabajo actual */
  hasta: FechaMes | null;
  ubicacion: string;
  modalidad: Modalidad;
  descripcion: string;
  logros: string[];
  tecnologias: string[];
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Estudio {
  id: string;
  tipo: TipoEstudio;
  institucion: string;
  titulo: string;
  desde: FechaMes;
  /** null = en curso */
  hasta: FechaMes | null;
  /** false con fecha de fin = no se terminó */
  finalizado: boolean;
  descripcion: string;
  urlVerificacion: string | null;
  certificado: { url: string } | null;
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
}
