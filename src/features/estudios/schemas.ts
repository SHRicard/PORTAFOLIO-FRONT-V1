import { z } from "zod";
import { enumerar } from "@/lib/queFalta";
import {
  fechaMes,
  fechaMesOpcional,
  texto,
  textoOpcional,
  urlOpcional,
  urlOpcionalOArchivo,
  vacioANull,
} from "@/lib/validaciones";
import type { CrearEstudioInput, Estudio, TipoEstudio } from "./types";

/** Validaciones del formulario. Reflejan las reglas del backend (docs/api/ESTUDIOS.md) */

export const TIPOS_ESTUDIO = ["carrera", "curso", "certificacion"] as const satisfies readonly TipoEstudio[];

/** Los campos que el backend puede rechazar y el formulario sabe marcar */
export const CAMPOS = ["tipo", "institucion", "titulo", "desde", "hasta", "descripcion", "urlVerificacion"] as const;

/** Si se ve en la web o no: el badge de la lista y de la barra del formulario (el mismo que el de experiencia) */
export const ESTADO_PUBLICACION = {
  publicado: { etiqueta: "Publicado", estilo: "primario" },
  oculto: { etiqueta: "Oculto", estilo: "peligro" },
} as const;
export const estadoDe = (publicado: boolean) => ESTADO_PUBLICACION[publicado ? "publicado" : "oculto"];

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
    /** Un PDF elegido guarda su URL local (blob:) hasta que se sube, al guardar */
    certificadoUrl: urlOpcionalOArchivo,
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

/**
 * Lo que le falta a un estudio para estar completo, en una línea (la lista y la vista previa del formulario), o
 * null si no le falta nada: «Falta la descripción», «Falta subir el certificado», «Falta la descripción y subir
 * el certificado». El certificado es opcional: solo falta si existe y todavía no se subió (`{ url: null }`)
 */
export function queFalta(estudio: Pick<Estudio, "descripcion" | "certificado">): string | null {
  const faltan = [
    ...(estudio.descripcion.trim() ? [] : ["la descripción"]),
    ...(estudio.certificado?.url === null ? ["subir el certificado"] : []),
  ];
  return faltan.length > 0 ? `Falta ${enumerar(faltan)}` : null;
}
