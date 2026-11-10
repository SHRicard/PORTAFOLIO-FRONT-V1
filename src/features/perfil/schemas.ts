import { z } from "zod";
import {
  aLineas,
  lineas,
  texto,
  textoOpcional,
  urlObligatoria,
  urlOpcional,
  urlOpcionalOArchivo,
  vacioANull,
} from "@/lib/validaciones";
import type {
  CategoriaHabilidad,
  GuardarPerfilInput,
  Modalidad,
  NivelIdioma,
  Perfil,
  TipoDatoCurioso,
  TipoRed,
} from "./types";

/** Validaciones del formulario. Reflejan las reglas del backend (docs/api/PERFIL.md) */

export const MODALIDADES = ["remoto", "hibrido", "presencial"] as const satisfies readonly Modalidad[];
export const REDES = [
  "github",
  "linkedin",
  "behance",
  "dribbble",
  "instagram",
  "x",
  "youtube",
  "sitio",
  "otra",
] as const satisfies readonly TipoRed[];
export const CATEGORIAS = [
  "front",
  "back",
  "mobile",
  "base-de-datos",
  "diseno",
  "herramientas",
  "otra",
] as const satisfies readonly CategoriaHabilidad[];
export const NIVELES = ["basico", "intermedio", "avanzado", "nativo"] as const satisfies readonly NivelIdioma[];
export const TIPOS_DATO = ["profesional", "personal"] as const satisfies readonly TipoDatoCurioso[];

const opcion = { message: "Elegí una opción" };

/** Igual que el backend: + y código de país, para que funcione wa.me */
const TELEFONO = /^\+[0-9][0-9\s\-()]{5,24}$/;

export const perfilSchema = z
  .object({
    nombreVisible: texto(80),
    rol: texto(80),
    frase: texto(100),
    ciudad: texto(80),
    pais: texto(80),
    modalidad: z.enum(MODALIDADES, opcion),
    disponible: z.boolean(),
    disponibilidadTexto: textoOpcional(160),
    bioCorta: texto(280),
    bioLarga: texto(2000),
    /** El contacto va plano, como la ubicación: `aPerfilInput` arma el bloque `contacto` */
    correo: z.string().trim().max(120, "Máximo 120 caracteres").pipe(z.email("Correo electrónico inválido")),
    telefono: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || TELEFONO.test(v),
        "Teléfono inválido: usá el formato internacional, por ejemplo +54 9 11 5555-1234",
      ),
    whatsapp: z.boolean(),
    redes: z.array(z.object({ tipo: z.enum(REDES, opcion), url: urlObligatoria })).max(20, "Máximo 20 redes"),
    mensaje: textoOpcional(200),
    /** Uno por línea */
    abiertoA: lineas(10, 40),
    tiempoRespuesta: textoOpcional(60),
    horario: textoOpcional(80),
    agenda: urlOpcional,
    habilidades: z
      .array(z.object({ nombre: texto(50), categoria: z.enum(CATEGORIAS, opcion) }))
      .max(100, "Máximo 100 habilidades"),
    idiomas: z.array(z.object({ idioma: texto(40), nivel: z.enum(NIVELES, opcion) })).max(20, "Máximo 20 idiomas"),
    datosCuriosos: z
      .array(z.object({ titulo: texto(60), valor: texto(100), tipo: z.enum(TIPOS_DATO, opcion) }))
      .max(30, "Máximo 30 datos curiosos"),
    /** La foto y el CV elegidos guardan su URL local (blob:) hasta que se suben, al guardar */
    fotoUrl: urlOpcionalOArchivo,
    fotoAlt: textoOpcional(200),
    cvUrl: urlOpcionalOArchivo,
    /** Existe pero todavía no se subió: no tiene campo propio, viaja con el formulario */
    cvPendiente: z.boolean(),
  })
  .refine((v) => !v.fotoUrl || v.fotoAlt, {
    path: ["fotoAlt"],
    message: "Describí la imagen: lo necesita quien no puede verla",
  })
  .refine((v) => !v.whatsapp || v.telefono, { path: ["telefono"], message: "Cargá el número para marcar WhatsApp" });

export type PerfilFormValues = z.infer<typeof perfilSchema>;

export const PERFIL_VACIO: PerfilFormValues = {
  nombreVisible: "",
  rol: "",
  frase: "",
  ciudad: "",
  pais: "",
  modalidad: "remoto",
  disponible: true,
  disponibilidadTexto: "",
  bioCorta: "",
  bioLarga: "",
  correo: "",
  telefono: "",
  whatsapp: false,
  redes: [],
  mensaje: "",
  abiertoA: "",
  tiempoRespuesta: "",
  horario: "",
  agenda: "",
  habilidades: [],
  idiomas: [],
  datosCuriosos: [],
  fotoUrl: "",
  fotoAlt: "",
  cvUrl: "",
  cvPendiente: false,
};

export function aFormulario(perfil: Perfil): PerfilFormValues {
  return {
    nombreVisible: perfil.nombreVisible,
    rol: perfil.rol,
    frase: perfil.frase,
    ciudad: perfil.ubicacion.ciudad,
    pais: perfil.ubicacion.pais,
    modalidad: perfil.modalidad,
    disponible: perfil.disponibilidad.disponible,
    disponibilidadTexto: perfil.disponibilidad.texto,
    bioCorta: perfil.bioCorta,
    bioLarga: perfil.bioLarga,
    correo: perfil.contacto.correo,
    telefono: perfil.contacto.telefono?.numero ?? "",
    whatsapp: perfil.contacto.telefono?.whatsapp ?? false,
    redes: perfil.contacto.redes,
    mensaje: perfil.contacto.mensaje,
    abiertoA: perfil.contacto.abiertoA.join("\n"),
    tiempoRespuesta: perfil.contacto.tiempoRespuesta,
    horario: perfil.contacto.horario,
    agenda: perfil.contacto.agenda ?? "",
    habilidades: perfil.habilidades,
    idiomas: perfil.idiomas,
    datosCuriosos: perfil.datosCuriosos,
    fotoUrl: perfil.foto?.url ?? "",
    fotoAlt: perfil.foto?.alt ?? "",
    cvUrl: perfil.cv?.url ?? "",
    cvPendiente: perfil.cv?.url === null,
  };
}

export function aPerfilInput(v: PerfilFormValues): GuardarPerfilInput {
  return {
    nombreVisible: v.nombreVisible,
    rol: v.rol,
    frase: v.frase,
    ubicacion: { ciudad: v.ciudad, pais: v.pais },
    modalidad: v.modalidad,
    disponibilidad: { disponible: v.disponible, texto: v.disponibilidadTexto },
    bioCorta: v.bioCorta,
    bioLarga: v.bioLarga,
    // Siempre el bloque completo: lo que no se manda, el backend lo deja vacío
    contacto: {
      correo: v.correo,
      telefono: v.telefono ? { numero: v.telefono, whatsapp: v.whatsapp } : null,
      redes: v.redes,
      mensaje: v.mensaje,
      abiertoA: aLineas(v.abiertoA),
      tiempoRespuesta: v.tiempoRespuesta,
      horario: v.horario,
      agenda: vacioANull(v.agenda),
    },
    habilidades: v.habilidades,
    idiomas: v.idiomas,
    datosCuriosos: v.datosCuriosos,
    foto: v.fotoUrl || v.fotoAlt ? { url: vacioANull(v.fotoUrl), alt: v.fotoAlt } : null,
    cv: v.cvUrl || v.cvPendiente ? { url: vacioANull(v.cvUrl) } : null,
  };
}

/** Campos que en la API se llaman distinto que en el formulario */
const RENOMBRADOS: Record<string, string> = {
  "ubicacion.ciudad": "ciudad",
  "ubicacion.pais": "pais",
  "disponibilidad.texto": "disponibilidadTexto",
  "foto.url": "fotoUrl",
  "foto.alt": "fotoAlt",
  "cv.url": "cvUrl",
  "telefono.numero": "telefono",
};

const CON_MENSAJE =
  /^(nombreVisible|rol|frase|ciudad|pais|modalidad|disponibilidadTexto|bioCorta|bioLarga|correo|telefono|mensaje|abiertoA|tiempoRespuesta|horario|agenda|fotoUrl|fotoAlt|cvUrl|(redes|habilidades|idiomas|datosCuriosos)\.(\d+\.\w+|root))$/;

/**
 * Nombre de un campo en la API -> en el formulario, o null si el formulario no tiene dónde mostrar su
 * error. Los del contacto llegan con prefijo (`contacto.correo`, `contacto.redes.0.url`).
 * `contacto.telefono.whatsapp` no tiene campo, como `disponibilidad.disponible`: son casillas
 */
export function campoFormulario(campo: string): string | null {
  const sinPrefijo = campo.replace(/^contacto\./, "");
  const nombre = (RENOMBRADOS[sinPrefijo] ?? sinPrefijo)
    .replace(/^abiertoA\.\d+$/, "abiertoA") // un elemento con error marca el textarea entero
    .replace(/^(redes|habilidades|idiomas|datosCuriosos)$/, "$1.root");
  return CON_MENSAJE.test(nombre) ? nombre : null;
}
