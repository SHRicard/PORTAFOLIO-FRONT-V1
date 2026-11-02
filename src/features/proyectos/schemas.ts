import { z } from "zod";
import {
  aLineas,
  fechaMes,
  lineas,
  slugOpcional,
  texto,
  textoOpcional,
  urlObligatoria,
  urlOpcional,
  vacioANull,
} from "@/lib/validaciones";
import type { CrearProyectoInput, EstadoProyecto, Proyecto, TiendaApp, TipoProyecto } from "./types";

/**
 * Validaciones del formulario. Reflejan las reglas del backend (docs/api/PROYECTOS.md).
 * El formulario trabaja con textos planos; aProyectoInput y aFormulario convierten
 * entre eso y lo que espera la API.
 */

export const TIPOS_PROYECTO = ["personal", "freelance", "empresa"] as const satisfies readonly TipoProyecto[];
export const ESTADOS_PROYECTO = ["borrador", "publicado", "privado"] as const satisfies readonly EstadoProyecto[];
export const TIENDAS = ["playStore", "appStore"] as const satisfies readonly TiendaApp[];

export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  privado: "Privado",
};

export const ESTADO_AYUDA: Record<EstadoProyecto, string> = {
  borrador: "Sin terminar: no se ve en la web",
  publicado: "Se ve en la web",
  privado: "Terminado pero oculto: no se ve en la web",
};

export const proyectoSchema = z
  .object({
    titulo: texto(80),
    slug: slugOpcional,
    tipo: z.enum(TIPOS_PROYECTO, { message: "Elegí una opción" }),
    rol: texto(80),
    fecha: fechaMes,
    resumen: texto(160),
    descripcion: texto(5000),
    tecnologias: lineas(60, 60),
    demo: urlOpcional,
    demoPorSolicitud: z.boolean(),
    repositorios: z.array(z.object({ nombre: texto(60), url: urlObligatoria })).max(10, "Máximo 10 repositorios"),
    tiendas: z
      .array(z.object({ tienda: z.enum(TIENDAS, { message: "Elegí una opción" }), app: texto(60), url: urlOpcional }))
      .max(10, "Máximo 10 tiendas"),
    apkUrl: urlOpcional,
    apkNota: textoOpcional(500),
    portadaUrl: urlOpcional,
    portadaAlt: textoOpcional(200),
    galeria: z.array(z.object({ url: urlOpcional, alt: texto(200) })).max(20, "Máximo 20 imágenes en la galería"),
    documentos: z.array(z.object({ url: urlOpcional, titulo: texto(120) })).max(10, "Máximo 10 documentos"),
    destacado: z.boolean(),
    estado: z.enum(ESTADOS_PROYECTO, { message: "Elegí una opción" }),
  })
  .refine((v) => !v.portadaUrl || v.portadaAlt, {
    path: ["portadaAlt"],
    message: "Describí la imagen: lo necesita quien no puede verla",
  });

export type ProyectoFormValues = z.infer<typeof proyectoSchema>;

export const PROYECTO_VACIO: ProyectoFormValues = {
  titulo: "",
  slug: "",
  tipo: "personal",
  rol: "",
  fecha: "",
  resumen: "",
  descripcion: "",
  tecnologias: "",
  demo: "",
  demoPorSolicitud: false,
  repositorios: [],
  tiendas: [],
  apkUrl: "",
  apkNota: "",
  portadaUrl: "",
  portadaAlt: "",
  galeria: [],
  documentos: [],
  destacado: false,
  estado: "borrador",
};

/** Del proyecto guardado a los valores del formulario */
export function aFormulario(proyecto: Proyecto): ProyectoFormValues {
  const { enlaces } = proyecto;
  return {
    titulo: proyecto.titulo,
    slug: proyecto.slug,
    tipo: proyecto.tipo,
    rol: proyecto.rol,
    fecha: proyecto.fecha,
    resumen: proyecto.resumen,
    descripcion: proyecto.descripcion,
    tecnologias: proyecto.tecnologias.join("\n"),
    demo: enlaces.demo ?? "",
    demoPorSolicitud: enlaces.demoPorSolicitud,
    repositorios: enlaces.repositorios,
    tiendas: enlaces.tiendas.map((t) => ({ ...t, url: t.url ?? "" })),
    apkUrl: enlaces.apkDemo?.url ?? "",
    apkNota: enlaces.apkDemo?.nota ?? "",
    portadaUrl: proyecto.portada?.url ?? "",
    portadaAlt: proyecto.portada?.alt ?? "",
    galeria: proyecto.galeria.map((i) => ({ url: i.url ?? "", alt: i.alt })),
    documentos: proyecto.documentos.map((d) => ({ url: d.url ?? "", titulo: d.titulo })),
    destacado: proyecto.destacado,
    estado: proyecto.estado,
  };
}

/** De los valores del formulario a lo que espera la API. Lo vacío viaja como null */
export function aProyectoInput(v: ProyectoFormValues): CrearProyectoInput {
  return {
    titulo: v.titulo,
    ...(v.slug && { slug: v.slug }), // sin slug, el backend lo arma o conserva el que tenía
    tipo: v.tipo,
    rol: v.rol,
    fecha: v.fecha,
    resumen: v.resumen,
    descripcion: v.descripcion,
    tecnologias: aLineas(v.tecnologias),
    enlaces: {
      demo: vacioANull(v.demo),
      demoPorSolicitud: v.demoPorSolicitud,
      repositorios: v.repositorios,
      tiendas: v.tiendas.map((t) => ({ ...t, url: vacioANull(t.url) })),
      apkDemo: v.apkUrl || v.apkNota ? { url: vacioANull(v.apkUrl), nota: v.apkNota } : null,
    },
    portada: v.portadaUrl || v.portadaAlt ? { url: vacioANull(v.portadaUrl), alt: v.portadaAlt } : null,
    galeria: v.galeria.map((i) => ({ url: vacioANull(i.url), alt: i.alt })),
    documentos: v.documentos.map((d) => ({ url: vacioANull(d.url), titulo: d.titulo })),
    destacado: v.destacado,
    estado: v.estado,
  };
}

/** Campos que en la API se llaman distinto que en el formulario */
const RENOMBRADOS: Record<string, string> = {
  "enlaces.demo": "demo",
  "enlaces.apkDemo.url": "apkUrl",
  "enlaces.apkDemo.nota": "apkNota",
  "portada.url": "portadaUrl",
  "portada.alt": "portadaAlt",
};

const CON_MENSAJE =
  /^(titulo|slug|tipo|rol|fecha|resumen|descripcion|tecnologias|demo|apkUrl|apkNota|portadaUrl|portadaAlt|estado|(repositorios|tiendas|galeria|documentos)\.(\d+\.\w+|root))$/;

/** Nombre de un campo en la API -> en el formulario, o null si el formulario no tiene dónde mostrar su error */
export function campoFormulario(campo: string): string | null {
  const nombre = (RENOMBRADOS[campo] ?? campo)
    .replace(/^enlaces\.(?=repositorios|tiendas)/, "")
    .replace(/^tecnologias\.\d+$/, "tecnologias")
    .replace(/^(repositorios|tiendas|galeria|documentos)$/, "$1.root");
  return CON_MENSAJE.test(nombre) ? nombre : null;
}

/** Lo que le falta a un proyecto para estar completo (se muestra en la lista del panel) */
export function pendientes(proyecto: Proyecto): string[] {
  const faltan: string[] = [];
  if (!proyecto.portada?.url) faltan.push("Sin portada");
  if (proyecto.galeria.some((i) => !i.url)) faltan.push("Imágenes sin subir");
  if (proyecto.documentos.some((d) => !d.url)) faltan.push("Documentos sin subir");
  if (proyecto.enlaces.tiendas.some((t) => !t.url)) faltan.push("Tiendas sin link");
  if (proyecto.enlaces.apkDemo && !proyecto.enlaces.apkDemo.url) faltan.push("APK sin link");
  return faltan;
}
