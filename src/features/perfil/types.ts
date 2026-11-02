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
  correoContacto: string;
  redes: Red[];
  habilidades: Habilidad[];
  idiomas: Idioma[];
  datosCuriosos: DatoCurioso[];
  foto: { url: string | null; alt: string } | null;
  cv: { url: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export type GuardarPerfilInput = Omit<Perfil, "id" | "createdAt" | "updatedAt">;
