/** Tipos del panel para estudios. Fuente: docs/api/ESTUDIOS.md */

export type TipoEstudio = "carrera" | "curso" | "certificacion";

export interface Estudio {
  id: string;
  tipo: TipoEstudio;
  institucion: string;
  titulo: string;
  /** AAAA-MM */
  desde: string;
  /** AAAA-MM · null = en curso */
  hasta: string | null;
  /** false con fecha de fin = no se terminó */
  finalizado: boolean;
  descripcion: string;
  urlVerificacion: string | null;
  /** url null = existe pero todavía no se subió */
  certificado: { url: string | null } | null;
  /** false = oculto: solo se ve en el panel */
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearEstudioInput {
  tipo: TipoEstudio;
  institucion: string;
  titulo: string;
  desde: string;
  hasta?: string | null;
  finalizado?: boolean;
  descripcion?: string;
  urlVerificacion?: string | null;
  certificado?: { url: string | null } | null;
  publicado?: boolean;
}

export type ActualizarEstudioInput = Partial<CrearEstudioInput>;
