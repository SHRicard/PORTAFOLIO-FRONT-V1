import { z } from "zod";
import { textoQueFalta } from "@/lib/queFalta";
import { aLineas, lineas, texto, textoOpcional, urlOpcionalOArchivo, vacioANull } from "@/lib/validaciones";
import type { CrearEntradaInput, Entrada, EntradaResumen, EstadoEntrada } from "./types";

/**
 * Validaciones del formulario. Reflejan las reglas del backend (docs/api/BLOG.md).
 * El formulario trabaja con textos planos; aEntradaInput y aFormulario convierten
 * entre eso y lo que espera la API.
 */

export const ESTADOS_ENTRADA = ["borrador", "publicado"] as const satisfies readonly EstadoEntrada[];

export const ESTADO_LABELS: Record<EstadoEntrada, string> = { borrador: "Borrador", publicado: "Publicada" };

/** El color del badge de cada estado, en la lista y en la barra del formulario */
export const ESTADO_ESTILO: Record<EstadoEntrada, "neutro" | "primario"> = {
  borrador: "neutro",
  publicado: "primario",
};

export const ESTADO_AYUDA: Record<EstadoEntrada, string> = {
  borrador: "Sin terminar: no se ve en la web",
  publicado: "Se ve en la web",
};

export const entradaSchema = z
  .object({
    titulo: texto(120),
    resumen: texto(200),
    contenido: texto(20000),
    etiquetas: lineas(10, 30),
    // Una foto o un PDF elegido se sube al guardar: mientras tanto, el campo tiene su URL local
    portadaUrl: urlOpcionalOArchivo,
    portadaAlt: textoOpcional(200),
    galeria: z
      .array(z.object({ url: urlOpcionalOArchivo, alt: texto(200) }))
      .max(20, "Máximo 20 imágenes en la galería"),
    documentos: z.array(z.object({ url: urlOpcionalOArchivo, titulo: texto(120) })).max(10, "Máximo 10 documentos"),
    estado: z.enum(ESTADOS_ENTRADA, { message: "Elegí una opción" }),
  })
  .refine((v) => !v.portadaUrl || v.portadaAlt, {
    path: ["portadaAlt"],
    message: "Describí la imagen: lo necesita quien no puede verla",
  });

export type EntradaFormValues = z.infer<typeof entradaSchema>;

export const ENTRADA_VACIA: EntradaFormValues = {
  titulo: "",
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

/**
 * De los valores del formulario a lo que espera la API. Lo vacío viaja como null. El slug no se manda: al crear,
 * el backend lo arma desde el título, y al editar la entrada conserva el que tenía
 */
export function aEntradaInput(v: EntradaFormValues): CrearEntradaInput {
  return {
    titulo: v.titulo,
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
  /^(titulo|resumen|contenido|etiquetas|portadaUrl|portadaAlt|estado|(galeria|documentos)\.(\d+\.\w+|root))$/;

/** Nombre de un campo en la API -> en el formulario, o null si el formulario no tiene dónde mostrar su error */
export function campoFormulario(campo: string): string | null {
  const nombre = (RENOMBRADOS[campo] ?? campo)
    .replace(/^etiquetas\.\d+$/, "etiquetas")
    .replace(/^(galeria|documentos)$/, "$1.root");
  return CON_MENSAJE.test(nombre) ? nombre : null;
}

/**
 * Lo que le falta a una entrada para estar completa, en una línea (la lista y la vista previa del formulario),
 * o null si no le falta nada: «Falta la portada», «Falta subir la portada, 2 fotos y el PDF»
 */
export function queFalta(entrada: Pick<EntradaResumen, "portada" | "galeria" | "documentos">): string | null {
  return textoQueFalta({
    sinPortada: !entrada.portada,
    portadaSinSubir: !!entrada.portada && !entrada.portada.url,
    fotos: entrada.galeria.filter((foto) => !foto.url).length,
    pdfs: entrada.documentos.filter((documento) => !documento.url).length,
  });
}
