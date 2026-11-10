/** Tipos del panel para el perfil público. Fuente: docs/api/PERFIL.md */

export type Modalidad = "remoto" | "hibrido" | "presencial";
export type TipoRed = "github" | "linkedin" | "behance" | "dribbble" | "instagram" | "x" | "youtube" | "sitio" | "otra";
export type CategoriaHabilidad = "front" | "back" | "mobile" | "base-de-datos" | "diseno" | "herramientas" | "otra";
export type NivelIdioma = "basico" | "intermedio" | "avanzado" | "nativo";
export type TipoDatoCurioso = "profesional" | "personal";

export interface Red {
  tipo: TipoRed;
  url: string;
}

export interface Telefono {
  /** Formato internacional, con + y código de país. Ej. "+54 9 11 5555-1234" */
  numero: string;
  /** true = el número tiene WhatsApp (mostrar el botón wa.me) */
  whatsapp: boolean;
}

/** Siempre viene con todas las claves. Lo vacío ("", [] o null) no se muestra */
export interface Contacto {
  /** Siempre viene, en minúsculas */
  correo: string;
  /** null = sin teléfono */
  telefono: Telefono | null;
  /** Lista abierta: se pueden sumar más redes (máximo 20) */
  redes: Red[];
  /** Ej. "Estoy escuchando ideas: proyectos, colaboraciones o algún desafío…". Puede venir "" */
  mensaje: string;
  /** Chips "Abierto a". Puede venir [] */
  abiertoA: string[];
  /** Ej. "Respondo en menos de 24 h". Puede venir "" */
  tiempoRespuesta: string;
  /** Ej. "Lun a vie, 9 a 18 h (GMT-3)". Puede venir "" */
  horario: string;
  /** URL https para agendar una llamada (Calendly, Cal.com…). null = no hay */
  agenda: string | null;
}

export interface Habilidad {
  nombre: string;
  categoria: CategoriaHabilidad;
}

export interface Idioma {
  idioma: string;
  nivel: NivelIdioma;
}

export interface DatoCurioso {
  titulo: string;
  valor: string;
  tipo: TipoDatoCurioso;
}

/** Tal cual está guardado: url null = todavía no se subió */
export interface Perfil {
  id: string;
  nombreVisible: string;
  rol: string;
  frase: string;
  ubicacion: { ciudad: string; pais: string };
  modalidad: Modalidad;
  disponibilidad: { disponible: boolean; texto: string };
  bioCorta: string;
  bioLarga: string;
  contacto: Contacto;
  habilidades: Habilidad[];
  idiomas: Idioma[];
  datosCuriosos: DatoCurioso[];
  foto: { url: string | null; alt: string } | null;
  cv: { url: string | null } | null;
  /** Id (carpeta) del diseño de la web pública, no su nombre: ej. "rr-dev" («mi.universo»). null = la vista por defecto del front */
  vista: string | null;
  createdAt: string;
  updatedAt: string;
}

/** El formulario no manda la vista: se elige aparte, y con PUT sin vista el backend conserva la elegida */
export type GuardarPerfilInput = Omit<Perfil, "id" | "createdAt" | "updatedAt" | "vista">;
