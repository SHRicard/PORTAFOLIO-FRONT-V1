import { getErrorMessage } from "@/lib/errors";
import type {
  CategoriaHabilidad,
  Estudio,
  FechaMes,
  Modalidad,
  NivelIdioma,
  TiendaApp,
  TipoDatoCurioso,
  TipoEstudio,
  TipoProyecto,
  TipoRed,
} from "./types";

const MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

/** "2022-11" -> "nov. 2022" */
export function mes(fecha: FechaMes): string {
  const [anio, numero] = fecha.split("-");
  return `${MESES[Number(numero) - 1] ?? numero} ${anio}`;
}

/** "nov. 2022 – actualidad" · "mar. 2020 – mar. 2021" */
export function rango(desde: FechaMes, hasta: FechaMes | null, textoActual = "actualidad"): string {
  return `${mes(desde)} – ${hasta ? mes(hasta) : textoActual}`;
}

export function estadoEstudio(estudio: Pick<Estudio, "hasta" | "finalizado">): string {
  if (estudio.hasta === null) return "En curso";
  return estudio.finalizado ? "Finalizado" : "Incompleto";
}

/** "2026-10-30T12:00:00.000Z" -> "30 de octubre de 2026" */
export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

/** Un 404 en un detalle público es un slug inexistente o algo que no está publicado */
export function mensajeDetalle(error: unknown, siNoExiste: string): string {
  const noExiste = typeof error === "object" && error !== null && "status" in error && error.status === 404;
  return noExiste ? siNoExiste : getErrorMessage(error);
}

export const mensajeErrorProyecto = (error: unknown) =>
  mensajeDetalle(error, "Este proyecto no existe o no está publicado.");

/** Los textos largos vienen con párrafos separados por una línea en blanco */
export function parrafos(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Agrupa respetando el orden en que vienen: [["front", [...]], ["mobile", [...]]] */
export function agruparPor<T, K extends string>(items: T[], clave: (item: T) => K): [K, T[]][] {
  const grupos = new Map<K, T[]>();
  for (const item of items) {
    const k = clave(item);
    grupos.set(k, [...(grupos.get(k) ?? []), item]);
  }
  return [...grupos.entries()];
}

export const MODALIDAD: Record<Modalidad, string> = { remoto: "Remoto", hibrido: "Híbrido", presencial: "Presencial" };

export const CATEGORIA: Record<CategoriaHabilidad, string> = {
  front: "Front-end",
  back: "Back-end",
  mobile: "Mobile",
  "base-de-datos": "Bases de datos",
  diseno: "Diseño",
  herramientas: "Herramientas",
  otra: "Otras",
};

export const NIVEL: Record<NivelIdioma, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  nativo: "Nativo",
};

export const RED: Record<TipoRed, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  behance: "Behance",
  dribbble: "Dribbble",
  instagram: "Instagram",
  x: "X",
  youtube: "YouTube",
  sitio: "Sitio web",
  otra: "Otro enlace",
};

export const TIENDA: Record<TiendaApp, string> = { playStore: "Google Play", appStore: "App Store" };

export const TIPO_PROYECTO: Record<TipoProyecto, string> = {
  personal: "Proyecto personal",
  freelance: "Freelance",
  empresa: "Proyecto de empresa",
};

export const TIPO_ESTUDIO: Record<TipoEstudio, string> = {
  carrera: "Carrera",
  curso: "Curso",
  certificacion: "Certificación",
};

export const TIPO_DATO: Record<TipoDatoCurioso, string> = { profesional: "Profesionales", personal: "Personales" };
