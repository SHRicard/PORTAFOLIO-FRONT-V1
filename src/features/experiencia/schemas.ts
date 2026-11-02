import { z } from "zod";
import { aLineas, fechaMes, fechaMesOpcional, lineas, texto, textoOpcional, vacioANull } from "@/lib/validaciones";
import type { CrearExperienciaInput, Experiencia, Modalidad } from "./types";

/** Validaciones del formulario. Reflejan las reglas del backend (docs/api/EXPERIENCIA.md) */

export const MODALIDADES = ["remoto", "hibrido", "presencial"] as const satisfies readonly Modalidad[];

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
