import { z } from "zod";
import {
  aLineas,
  fechaMes,
  lineas,
  texto,
  textoOpcional,
  urlObligatoria,
  urlOpcionalOArchivo,
  vacioANull,
} from "@/lib/validaciones";
import { textoQueFalta } from "@/lib/queFalta";
import type { CrearProyectoInput, EstadoProyecto, Proyecto, TipoProyecto } from "./types";

/**
 * Validaciones del formulario. Reflejan las reglas del backend (docs/api/PROYECTOS.md).
 * El formulario trabaja con textos planos; aProyectoInput y aFormulario convierten
 * entre eso y lo que espera la API.
 */

export const TIPOS_PROYECTO = ["personal", "freelance", "empresa"] as const satisfies readonly TipoProyecto[];
export const ESTADOS_PROYECTO = ["borrador", "publicado", "privado"] as const satisfies readonly EstadoProyecto[];

export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  privado: "Privado",
};

/** El color del badge de cada estado, en la lista y en la cabecera del formulario */
export const ESTADO_ESTILO: Record<EstadoProyecto, "neutro" | "primario" | "peligro"> = {
  borrador: "neutro",
  publicado: "primario",
  privado: "peligro",
};

export const ESTADO_AYUDA: Record<EstadoProyecto, string> = {
  borrador: "Sin terminar: no se ve en la web",
  publicado: "Se ve en la web",
  privado: "Terminado pero oculto: no se ve en la web",
};

export const proyectoSchema = z
  .object({
    titulo: texto(80),
    tipo: z.enum(TIPOS_PROYECTO, { message: "Elegí una opción" }),
    rol: texto(80),
    fecha: fechaMes,
    resumen: texto(160),
    descripcion: texto(5000),
    tecnologias: lineas(60, 60),
    repositorios: z.array(z.object({ nombre: texto(60), url: urlObligatoria })).max(10, "Máximo 10 repositorios"),
    // Una foto o un PDF elegido se sube al guardar: mientras tanto, el campo tiene su URL local
    portadaUrl: urlOpcionalOArchivo,
    portadaAlt: textoOpcional(200),
    galeria: z
      .array(z.object({ url: urlOpcionalOArchivo, alt: texto(200) }))
      .max(20, "Máximo 20 imágenes en la galería"),
    documentos: z.array(z.object({ url: urlOpcionalOArchivo, titulo: texto(120) })).max(10, "Máximo 10 documentos"),
    destacado: z.boolean(),
    estado: z.enum(ESTADOS_PROYECTO, { message: "Elegí una opción" }),
  })
  .refine((v) => !v.portadaUrl || v.portadaAlt, {
    path: ["portadaAlt"],
    message: "Describí la imagen: lo necesita quien no puede verla",
  })
  // En la API la portada es la primera imagen de la galería: el backend acepta 20 en total
  .refine((v) => v.galeria.length + (v.portadaUrl || v.portadaAlt ? 1 : 0) <= 20, {
    path: ["galeria"],
    message: "Máximo 20 imágenes, contando la portada",
  });

export type ProyectoFormValues = z.infer<typeof proyectoSchema>;

export const PROYECTO_VACIO: ProyectoFormValues = {
  titulo: "",
  tipo: "personal",
  rol: "",
  fecha: "",
  resumen: "",
  descripcion: "",
  tecnologias: "",
  repositorios: [],
  portadaUrl: "",
  portadaAlt: "",
  galeria: [],
  documentos: [],
  destacado: false,
  estado: "borrador",
};

/** Del proyecto guardado a los valores del formulario. La primera imagen de la galería va al campo Portada */
export function aFormulario(proyecto: Proyecto): ProyectoFormValues {
  const [portada, ...galeria] = proyecto.galeria;
  return {
    titulo: proyecto.titulo,
    tipo: proyecto.tipo,
    rol: proyecto.rol,
    fecha: proyecto.fecha,
    resumen: proyecto.resumen,
    descripcion: proyecto.descripcion,
    tecnologias: proyecto.tecnologias.join("\n"),
    repositorios: proyecto.repositorios,
    portadaUrl: portada?.url ?? "",
    portadaAlt: portada?.alt ?? "",
    galeria: galeria.map((i) => ({ url: i.url ?? "", alt: i.alt })),
    documentos: proyecto.documentos.map((d) => ({ url: d.url ?? "", titulo: d.titulo })),
    destacado: proyecto.destacado,
    estado: proyecto.estado,
  };
}

/**
 * De los valores del formulario a lo que espera la API. Lo vacío viaja como null. La portada va primera en la galería.
 * El slug no se manda: al crear, el backend lo arma desde el título, y al editar el proyecto conserva el que tenía
 */
export function aProyectoInput(v: ProyectoFormValues): CrearProyectoInput {
  const portada = v.portadaUrl || v.portadaAlt ? [{ url: vacioANull(v.portadaUrl), alt: v.portadaAlt }] : [];
  return {
    titulo: v.titulo,
    tipo: v.tipo,
    rol: v.rol,
    fecha: v.fecha,
    resumen: v.resumen,
    descripcion: v.descripcion,
    tecnologias: aLineas(v.tecnologias),
    repositorios: v.repositorios,
    galeria: [...portada, ...v.galeria.map((i) => ({ url: vacioANull(i.url), alt: i.alt }))],
    documentos: v.documentos.map((d) => ({ url: vacioANull(d.url), titulo: d.titulo })),
    destacado: v.destacado,
    estado: v.estado,
  };
}

const CON_MENSAJE =
  /^(titulo|tipo|rol|fecha|resumen|descripcion|tecnologias|portadaUrl|portadaAlt|estado|(repositorios|galeria|documentos)\.(\d+\.\w+|root))$/;

/**
 * Nombre de un campo en la API -> en el formulario, o null si el formulario no tiene dónde mostrar su error.
 * conPortada: el formulario tiene portada, así que galeria.0 de la API es la portada y galeria.N es galeria.(N-1)
 */
export function campoFormulario(campo: string, conPortada = false): string | null {
  let nombre = campo;
  const imagen = /^galeria\.(\d+)\.(url|alt)$/.exec(campo);
  if (imagen && conPortada) {
    const [, numero, parte] = imagen;
    const i = Number(numero);
    nombre = i === 0 ? (parte === "url" ? "portadaUrl" : "portadaAlt") : `galeria.${i - 1}.${parte}`;
  }
  nombre = nombre
    .replace(/^tecnologias\.\d+$/, "tecnologias")
    .replace(/^(repositorios|galeria|documentos)$/, "$1.root");
  return CON_MENSAJE.test(nombre) ? nombre : null;
}

/**
 * Lo que le falta a un proyecto para estar completo, en una línea (la lista y la vista previa del formulario),
 * o null si no le falta nada. La portada es la primera imagen de la galería: «Falta la portada» si la galería
 * está vacía; «Falta subir…» lo que tiene descripción pero todavía no su archivo (`url: null`)
 */
export function queFalta(proyecto: Pick<Proyecto, "galeria" | "documentos">): string | null {
  const [portada, ...fotos] = proyecto.galeria;
  return textoQueFalta({
    sinPortada: !portada,
    portadaSinSubir: !!portada && !portada.url,
    fotos: fotos.filter((foto) => !foto.url).length,
    pdfs: proyecto.documentos.filter((documento) => !documento.url).length,
  });
}
