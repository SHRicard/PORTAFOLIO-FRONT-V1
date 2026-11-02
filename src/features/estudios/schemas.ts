import { z } from "zod";
import { fechaMes, fechaMesOpcional, texto, textoOpcional, urlOpcional, vacioANull } from "@/lib/validaciones";
import type { CrearEstudioInput, Estudio, TipoEstudio } from "./types";

/** Validaciones del formulario. Reflejan las reglas del backend (docs/api/ESTUDIOS.md) */

export const TIPOS_ESTUDIO = ["carrera", "curso", "certificacion"] as const satisfies readonly TipoEstudio[];

export const estudioSchema = z
  .object({
    tipo: z.enum(TIPOS_ESTUDIO, { message: "Elegí una opción" }),
    institucion: texto(120),
    titulo: texto(120),
    desde: fechaMes,
    hasta: fechaMesOpcional,
    finalizado: z.boolean(),
    descripcion: textoOpcional(2000),
    urlVerificacion: urlOpcional,
    certificadoUrl: urlOpcional,
    /** Existe pero todavía no se subió: no tiene campo propio, viaja con el formulario */
    certificadoPendiente: z.boolean(),
    publicado: z.boolean(),
  })
  // Las fechas son AAAA-MM, así que se pueden comparar como texto
  .refine((v) => !v.hasta || v.hasta >= v.desde, {
    path: ["hasta"],
    message: "La fecha de fin no puede ser anterior a la de inicio",
  })
  .refine((v) => !v.finalizado || v.hasta, {
    path: ["hasta"],
    message: "Un estudio finalizado necesita fecha de fin",
  });

export type EstudioFormValues = z.infer<typeof estudioSchema>;

export const ESTUDIO_VACIO: EstudioFormValues = {
  tipo: "curso",
  institucion: "",
  titulo: "",
  desde: "",
  hasta: "",
  finalizado: false,
  descripcion: "",
  urlVerificacion: "",
  certificadoUrl: "",
  certificadoPendiente: false,
  publicado: true,
};

export function aFormulario(estudio: Estudio): EstudioFormValues {
  return {
    tipo: estudio.tipo,
    institucion: estudio.institucion,
    titulo: estudio.titulo,
    desde: estudio.desde,
    hasta: estudio.hasta ?? "",
    finalizado: estudio.finalizado,
    descripcion: estudio.descripcion,
    urlVerificacion: estudio.urlVerificacion ?? "",
    certificadoUrl: estudio.certificado?.url ?? "",
    certificadoPendiente: estudio.certificado?.url === null,
    publicado: estudio.publicado,
  };
}

export function aEstudioInput({ certificadoUrl, certificadoPendiente, ...v }: EstudioFormValues): CrearEstudioInput {
  return {
    ...v,
    hasta: vacioANull(v.hasta),
    urlVerificacion: vacioANull(v.urlVerificacion),
    certificado: certificadoUrl || certificadoPendiente ? { url: vacioANull(certificadoUrl) } : null,
  };
}
