import { z } from "zod";
import { aLineas, lineas, slugOpcional, texto, textoOpcional, urlOpcional, vacioANull } from "@/lib/validaciones";
import type { CrearEntradaInput, Entrada, EntradaResumen, EstadoEntrada } from "./types";

/**
 * Validaciones del formulario. Reflejan las reglas del backend (docs/api/BLOG.md).
 * El formulario trabaja con textos planos; aEntradaInput y aFormulario convierten
 * entre eso y lo que espera la API.
 */

export const ESTADOS_ENTRADA = ["borrador", "publicado"] as const satisfies readonly EstadoEntrada[];

export const ESTADO_LABELS: Record<EstadoEntrada, string> = { borrador: "Borrador", publicado: "Publicada" };

export const ESTADO_AYUDA: Record<EstadoEntrada, string> = {
  borrador: "Sin terminar: no se ve en la web",
  publicado: "Se ve en la web",
};

export const entradaSchema = z
  .object({
    titulo: texto(120),
    slug: slugOpcional,
    resumen: texto(200),
    contenido: texto(20000),
    etiquetas: lineas(10, 30),
    portadaUrl: urlOpcional,
    portadaAlt: textoOpcional(200),
    galeria: z.array(z.object({ url: urlOpcional, alt: texto(200) })).max(20, "Máximo 20 imágenes en la galería"),
    documentos: z.array(z.object({ url: urlOpcional, titulo: texto(120) })).max(10, "Máximo 10 documentos"),
    estado: z.enum(ESTADOS_ENTRADA, { message: "Elegí una opción" }),
  })
  .refine((v) => !v.portadaUrl || v.portadaAlt, {
    path: ["portadaAlt"],
    message: "Describí la imagen: lo necesita quien no puede verla",
  });

export type EntradaFormValues = z.infer<typeof entradaSchema>;

export const ENTRADA_VACIA: EntradaFormValues = {
  titulo: "",
  slug: "",
  resumen: "",
  contenido: "",
  etiquetas: "",
  portadaUrl: "",
  portadaAlt: "",
  galeria: [],
  documentos: [],
  estado: "borrador",
};

/** De la entrada guardada a los valores del formulario */
export function aFormulario(entrada: Entrada): EntradaFormValues {
  return {
    titulo: entrada.titulo,
    slug: entrada.slug,
    resumen: entrada.resumen,
    contenido: entrada.contenido,
    etiquetas: entrada.etiquetas.join("\n"),
    portadaUrl: entrada.portada?.url ?? "",
    portadaAlt: entrada.portada?.alt ?? "",
    galeria: entrada.galeria.map((i) => ({ url: i.url ?? "", alt: i.alt })),
    documentos: entrada.documentos.map((d) => ({ url: d.url ?? "", titulo: d.titulo })),
    estado: entrada.estado,
  };
}

/** De los valores del formulario a lo que espera la API. Lo vacío viaja como null */
export function aEntradaInput(v: EntradaFormValues): CrearEntradaInput {
  return {
    titulo: v.titulo,
    ...(v.slug && { slug: v.slug }), // sin slug, el backend lo arma o conserva el que tenía
    resumen: v.resumen,
    contenido: v.contenido,
    etiquetas: aLineas(v.etiquetas),
    portada: v.portadaUrl || v.portadaAlt ? { url: vacioANull(v.portadaUrl), alt: v.portadaAlt } : null,
    galeria: v.galeria.map((i) => ({ url: vacioANull(i.url), alt: i.alt })),
    documentos: v.documentos.map((d) => ({ url: vacioANull(d.url), titulo: d.titulo })),
    estado: v.estado,
  };
}

/** Campos que en la API se llaman distinto que en el formulario */
const RENOMBRADOS: Record<string, string> = { "portada.url": "portadaUrl", "portada.alt": "portadaAlt" };

const CON_MENSAJE =
  /^(titulo|slug|resumen|contenido|etiquetas|portadaUrl|portadaAlt|estado|(galeria|documentos)\.(\d+\.\w+|root))$/;

/** Nombre de un campo en la API -> en el formulario, o null si el formulario no tiene dónde mostrar su error */
export function campoFormulario(campo: string): string | null {
  const nombre = (RENOMBRADOS[campo] ?? campo)
    .replace(/^etiquetas\.\d+$/, "etiquetas")
    .replace(/^(galeria|documentos)$/, "$1.root");
  return CON_MENSAJE.test(nombre) ? nombre : null;
}

/** Lo que le falta a una entrada para estar completa (se muestra en la lista del panel) */
export function pendientes(entrada: EntradaResumen): string[] {
  const faltan: string[] = [];
  if (!entrada.portada?.url) faltan.push("Sin portada");
  if (entrada.galeria.some((i) => !i.url)) faltan.push("Imágenes sin subir");
  if (entrada.documentos.some((d) => !d.url)) faltan.push("Documentos sin subir");
  return faltan;
}
