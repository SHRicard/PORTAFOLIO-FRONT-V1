/** Tipos del panel para experiencia. Fuente: docs/api/EXPERIENCIA.md */

export type Modalidad = "remoto" | "hibrido" | "presencial";

export interface Experiencia {
  id: string;
  empresa: string;
  puesto: string;
  /** AAAA-MM */
  desde: string;
  /** AAAA-MM · null = trabajo actual */
  hasta: string | null;
  ubicacion: string;
  modalidad: Modalidad;
  descripcion: string;
  logros: string[];
  tecnologias: string[];
  /** false = oculto: solo se ve en el panel */
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearExperienciaInput {
  empresa: string;
  puesto: string;
  desde: string;
  hasta?: string | null;
  ubicacion?: string;
  modalidad: Modalidad;
  descripcion?: string;
  logros?: string[];
  tecnologias?: string[];
  publicado?: boolean;
}

export type ActualizarExperienciaInput = Partial<CrearExperienciaInput>;
