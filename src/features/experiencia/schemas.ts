import { z } from "zod";
import { enumerar } from "@/lib/queFalta";
import { aLineas, fechaMes, fechaMesOpcional, lineas, texto, textoOpcional, vacioANull } from "@/lib/validaciones";
import type { CrearExperienciaInput, Experiencia, Modalidad } from "./types";

/** Validaciones del formulario. Reflejan las reglas del backend (docs/api/EXPERIENCIA.md) */

export const MODALIDADES = ["remoto", "hibrido", "presencial"] as const satisfies readonly Modalidad[];

/** Los campos que el backend puede rechazar y el formulario sabe marcar */
export const CAMPOS = ["empresa", "puesto", "desde", "hasta", "ubicacion", "modalidad", "descripcion"] as const;

/** Si se ve en la web o no: el badge de la lista y de la barra del formulario */
export const ESTADO_TRABAJO = {
  publicado: { etiqueta: "Publicado", estilo: "primario" },
  oculto: { etiqueta: "Oculto", estilo: "peligro" },
} as const;
export const estadoDe = (publicado: boolean) => ESTADO_TRABAJO[publicado ? "publicado" : "oculto"];

export const experienciaSchema = z
  .object({
    empresa: texto(80),
    puesto: texto(80),
    desde: fechaMes,
    hasta: fechaMesOpcional,
    ubicacion: textoOpcional(80),
    modalidad: z.enum(MODALIDADES, { message: "Elegí una opción" }),
    descripcion: textoOpcional(2000),
    logros: lineas(20, 400),
    tecnologias: lineas(60, 60),
    publicado: z.boolean(),
  })
  // Las fechas son AAAA-MM, así que se pueden comparar como texto
  .refine((v) => !v.hasta || v.hasta >= v.desde, {
    path: ["hasta"],
    message: "La fecha de fin no puede ser anterior a la de inicio",
  });

export type ExperienciaFormValues = z.infer<typeof experienciaSchema>;

export const EXPERIENCIA_VACIA: ExperienciaFormValues = {
  empresa: "",
  puesto: "",
  desde: "",
  hasta: "",
  ubicacion: "",
  modalidad: "remoto",
  descripcion: "",
  logros: "",
  tecnologias: "",
  publicado: true,
};

export function aFormulario(experiencia: Experiencia): ExperienciaFormValues {
  return {
    empresa: experiencia.empresa,
    puesto: experiencia.puesto,
    desde: experiencia.desde,
    hasta: experiencia.hasta ?? "",
    ubicacion: experiencia.ubicacion,
    modalidad: experiencia.modalidad,
    descripcion: experiencia.descripcion,
    logros: experiencia.logros.join("\n"),
    tecnologias: experiencia.tecnologias.join("\n"),
    publicado: experiencia.publicado,
  };
}

export function aExperienciaInput(v: ExperienciaFormValues): CrearExperienciaInput {
  return {
    ...v,
    hasta: vacioANull(v.hasta),
    logros: aLineas(v.logros),
    tecnologias: aLineas(v.tecnologias),
  };
}

/**
 * Lo que le falta a un trabajo para estar completo, en una línea (la lista y la vista previa del formulario), o
 * null si no le falta nada: «Falta la descripción», «Faltan los logros y las tecnologías»
 */
export function queFalta(trabajo: Pick<Experiencia, "descripcion" | "logros" | "tecnologias">): string | null {
  const faltan = [
    ...(trabajo.descripcion.trim() ? [] : ["la descripción"]),
    ...(trabajo.logros.length > 0 ? [] : ["los logros"]),
    ...(trabajo.tecnologias.length > 0 ? [] : ["las tecnologías"]),
  ];
  if (faltan.length === 0) return null;
  return `${faltan.length === 1 && faltan[0] === "la descripción" ? "Falta" : "Faltan"} ${enumerar(faltan)}`;
}
