/**
 * Fuentes que se pueden elegir en Apariencia. Vienen de Fontsource (npm): se sirven desde
 * el propio sitio y el navegador baja solo las que están en uso, por eso cada una se
 * importa de forma dinámica.
 *
 * Para sumar una: instalar su paquete y agregar una línea en GRUPOS_FUENTES.
 * El label de las variables tiene que ser el nombre exacto de la fuente: los paquetes de
 * @fontsource-variable la registran como "<Nombre> Variable" y, si no coincide, el
 * navegador usa la de respaldo sin avisar. También hay que sumarla en COMBINACIONES.
 */
import type { ThemeVars } from "./themeTypes";

export interface Fuente {
  label: string;
  /** Valor de font-family: es lo que se guarda en el tema */
  value: string;
  /** Las del sistema no traen nada que cargar */
  cargar?: () => Promise<unknown>;
}

export interface GrupoFuentes {
  label: string;
  fuentes: Fuente[];
}

const SANS = "ui-sans-serif, system-ui, sans-serif";
const SERIF = "ui-serif, Georgia, serif";
const MONO = "ui-monospace, Menlo, monospace";

const variable = (label: string, respaldo: string, cargar: Fuente["cargar"]): Fuente => ({
  label,
  value: `"${label} Variable", ${respaldo}`,
  cargar,
});

export const GRUPOS_FUENTES: GrupoFuentes[] = [
  {
    label: "Del sistema",
    fuentes: [
      { label: "Sistema (sans-serif)", value: SANS },
      { label: "Serif", value: SERIF },
      { label: "Monoespaciada", value: MONO },
    ],
  },
  {
    label: "Modernas",
    fuentes: [
      variable("Atkinson Hyperlegible Next", SANS, () => import("@fontsource-variable/atkinson-hyperlegible-next/index.css")),
      variable("DM Sans", SANS, () => import("@fontsource-variable/dm-sans/index.css")),
      variable("Figtree", SANS, () => import("@fontsource-variable/figtree/index.css")),
      variable("Inter", SANS, () => import("@fontsource-variable/inter/index.css")),
      {
        // Sin versión variable, y solo existe en estos dos pesos de los que usa la app
        label: "Lato",
        value: `"Lato", ${SANS}`,
        cargar: () => Promise.all([import("@fontsource/lato/400.css"), import("@fontsource/lato/700.css")]),
      },
      variable("Lexend", SANS, () => import("@fontsource-variable/lexend/index.css")),
      variable("Manrope", SANS, () => import("@fontsource-variable/manrope/index.css")),
      variable("Montserrat", SANS, () => import("@fontsource-variable/montserrat/index.css")),
      variable("Nunito", SANS, () => import("@fontsource-variable/nunito/index.css")),
      variable("Open Sans", SANS, () => import("@fontsource-variable/open-sans/index.css")),
      variable("Outfit", SANS, () => import("@fontsource-variable/outfit/index.css")),
      variable("Plus Jakarta Sans", SANS, () => import("@fontsource-variable/plus-jakarta-sans/index.css")),
      {
        // Sin versión variable: se carga cada peso que usa la app
        label: "Poppins",
        value: `"Poppins", ${SANS}`,
        cargar: () =>
          Promise.all([
            import("@fontsource/poppins/400.css"),
            import("@fontsource/poppins/500.css"),
            import("@fontsource/poppins/600.css"),
            import("@fontsource/poppins/700.css"),
          ]),
      },
      variable("Roboto", SANS, () => import("@fontsource-variable/roboto/index.css")),
      variable("Source Sans 3", SANS, () => import("@fontsource-variable/source-sans-3/index.css")),
      variable("Space Grotesk", SANS, () => import("@fontsource-variable/space-grotesk/index.css")),
      variable("Work Sans", SANS, () => import("@fontsource-variable/work-sans/index.css")),
    ],
  },
  {
    label: "Clásicas",
    fuentes: [
      variable("Bitter", SERIF, () => import("@fontsource-variable/bitter/index.css")),
      variable("Libre Baskerville", SERIF, () => import("@fontsource-variable/libre-baskerville/index.css")),
      variable("Literata", SERIF, () => import("@fontsource-variable/literata/index.css")),
      variable("Lora", SERIF, () => import("@fontsource-variable/lora/index.css")),
      variable("Merriweather", SERIF, () => import("@fontsource-variable/merriweather/index.css")),
      variable("Playfair Display", SERIF, () => import("@fontsource-variable/playfair-display/index.css")),
      variable("Source Serif 4", SERIF, () => import("@fontsource-variable/source-serif-4/index.css")),
    ],
  },
  {
    label: "Monoespaciadas",
    fuentes: [
      variable("Fira Code", MONO, () => import("@fontsource-variable/fira-code/index.css")),
      variable("JetBrains Mono", MONO, () => import("@fontsource-variable/jetbrains-mono/index.css")),
      variable("Source Code Pro", MONO, () => import("@fontsource-variable/source-code-pro/index.css")),
    ],
  },
];

const FUENTES = GRUPOS_FUENTES.flatMap((grupo) => grupo.fuentes);

/**
 * Lo que acompaña a cada fuente de títulos: [subtítulos, texto]. Se elige solo la de los
 * títulos y las otras dos salen de acá. El criterio es el contraste: títulos modernos con
 * texto clásico y al revés, o dos fuentes de la misma familia. Dos sin serifa parecidas
 * juntas (Lexend + Roboto) ni combinan ni contrastan.
 */
const COMBINACIONES: Record<string, [string, string]> = {
  "Sistema (sans-serif)": ["Sistema (sans-serif)", "Sistema (sans-serif)"],
  Serif: ["Serif", "Sistema (sans-serif)"],
  Monoespaciada: ["Monoespaciada", "Sistema (sans-serif)"],

  "Atkinson Hyperlegible Next": ["Atkinson Hyperlegible Next", "Literata"],
  "DM Sans": ["DM Sans", "Lora"],
  Figtree: ["Figtree", "Source Serif 4"],
  Inter: ["Inter", "Source Serif 4"],
  Lato: ["Lato", "Source Serif 4"],
  Lexend: ["Lexend", "Source Serif 4"],
  Manrope: ["Manrope", "Literata"],
  Montserrat: ["Montserrat", "Lora"],
  Nunito: ["Nunito", "Lora"],
  "Open Sans": ["Open Sans", "Lora"],
  Outfit: ["Outfit", "Literata"],
  "Plus Jakarta Sans": ["Plus Jakarta Sans", "Source Serif 4"],
  Poppins: ["Poppins", "Lora"],
  Roboto: ["Roboto", "Literata"],
  "Source Sans 3": ["Source Sans 3", "Source Serif 4"],
  "Space Grotesk": ["JetBrains Mono", "Inter"],
  "Work Sans": ["Work Sans", "Bitter"],

  Bitter: ["Bitter", "Source Sans 3"],
  "Libre Baskerville": ["Source Sans 3", "Source Sans 3"],
  Literata: ["Literata", "Inter"],
  Lora: ["Lora", "Open Sans"],
  Merriweather: ["Merriweather", "Lato"],
  "Playfair Display": ["Lato", "Lato"],
  "Source Serif 4": ["Source Serif 4", "Source Sans 3"],

  "Fira Code": ["Fira Code", "Inter"],
  "JetBrains Mono": ["JetBrains Mono", "Inter"],
  "Source Code Pro": ["Source Code Pro", "Source Sans 3"],
};

const valorDe = (label: string | undefined) => FUENTES.find((fuente) => fuente.label === label)?.value;

/** Las tres fuentes del tema a partir de la de títulos. Sin combinación, las tres son la misma. */
export function combinacionDe(fuenteTitulo: string): Pick<ThemeVars, "fuenteTitulo" | "fuenteSubtitulo" | "fuenteTexto"> {
  const titulo = FUENTES.find((fuente) => fuente.value === fuenteTitulo);
  const combinacion = titulo && COMBINACIONES[titulo.label];
  return {
    fuenteTitulo,
    fuenteSubtitulo: valorDe(combinacion?.[0]) ?? fuenteTitulo,
    fuenteTexto: valorDe(combinacion?.[1]) ?? fuenteTitulo,
  };
}

/** Nombre para mostrar de un valor de font-family */
export const nombreFuente = (value: string) => FUENTES.find((fuente) => fuente.value === value)?.label ?? value;

/** Carga una fuente por su valor de font-family. Si falla, se sigue viendo la de respaldo. */
export async function cargarFuente(value: string): Promise<void> {
  try {
    await FUENTES.find((fuente) => fuente.value === value)?.cargar?.();
  } catch {
    // El font-family ya trae su respaldo: no hay nada que romper
  }
}

/**
 * Baja todas las fuentes para mostrar cada nombre con su propio estilo. Solo la usa la
 * pantalla de Apariencia: los visitantes bajan únicamente las fuentes del tema.
 */
export async function cargarTodasLasFuentes(): Promise<void> {
  await Promise.all(
    FUENTES.map(async ({ label, value }) => {
      await cargarFuente(value);
      try {
        // El CSS solo declara la fuente: el navegador baja el archivo cuando hace falta pintarla
        await document.fonts.load(`16px ${value}`, label);
      } catch {
        // Ese nombre se ve con la fuente de respaldo
      }
    }),
  );
}
