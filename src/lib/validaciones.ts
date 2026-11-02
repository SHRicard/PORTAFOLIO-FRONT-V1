import { z } from "zod";

/**
 * Reglas compartidas de los formularios del panel. Reflejan las del backend (docs/api/)
 * para avisar antes de enviar. El backend siempre vuelve a validar.
 */

const FECHA_MES = /^\d{4}-(0[1-9]|1[0-2])$/;
const MENSAJE_FECHA = "Usá el formato AAAA-MM (ej. 2024-07)";
const MENSAJE_URL = "La URL tiene que empezar con https://";
const MENSAJE_LARGO_URL = "La URL es demasiado larga";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const esHttps = (valor: string) => valor.startsWith("https://") && URL.canParse(valor);

export const texto = (max: number) =>
  z.string().trim().min(1, "Este campo es obligatorio").max(max, `Máximo ${max} caracteres`);

export const textoOpcional = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`);

export const fechaMes = z.string().regex(FECHA_MES, MENSAJE_FECHA);

/** Vacío = sin fecha de fin (trabajo actual o estudio en curso) */
export const fechaMesOpcional = z.string().refine((v) => v === "" || FECHA_MES.test(v), MENSAJE_FECHA);

export const urlObligatoria = z.string().trim().max(500, MENSAJE_LARGO_URL).refine(esHttps, MENSAJE_URL);

/** Vacío = todavía no se tiene (se guarda como null) */
export const urlOpcional = z
  .string()
  .trim()
  .max(500, MENSAJE_LARGO_URL)
  .refine((v) => v === "" || esHttps(v), MENSAJE_URL);

/** Texto con un elemento por línea -> lista sin líneas vacías */
export const aLineas = (valor: string) =>
  valor
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

/** Lista escrita en un textarea, un elemento por línea */
export const lineas = (maxItems: number, maxLargo: number) =>
  z
    .string()
    .refine((v) => aLineas(v).length <= maxItems, `Máximo ${maxItems} elementos`)
    .refine((v) => aLineas(v).every((l) => l.length <= maxLargo), `Cada línea admite hasta ${maxLargo} caracteres`);

export const vacioANull = (valor: string) => valor.trim() || null;

/** Vacío = el backend lo arma desde el título, o conserva el que tenía */
export const slugOpcional = z
  .string()
  .trim()
  .max(80, "Máximo 80 caracteres")
  .refine((v) => v === "" || SLUG.test(v), "Solo minúsculas, números y guiones (ej. mi-proyecto)")
  .refine((v) => v !== "admin", 'El slug "admin" está reservado');

/** Mismo criterio que el backend al armar el slug desde el título */
const aSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

/**
 * Carpeta de Cloudinary de un recurso, ej. "blogs/mi-noticia".
 * Al crearlo todavía no hay slug guardado: sale de lo escrito en el formulario.
 */
export function carpetaDe(base: string, slug: string, titulo: string) {
  const nombre = aSlug(slug || titulo);
  return nombre ? `${base}/${nombre}` : base;
}
