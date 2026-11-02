import type { ThemeVars } from "./themeTypes";

/** Todo lo que define una paleta. Los colores no se eligen sueltos: se elige el pack completo. */
export type ColoresPaleta = Pick<
  ThemeVars,
  | "primario"
  | "primarioOscuro"
  | "secundario"
  | "fondo"
  | "superficie"
  | "borde"
  | "texto"
  | "textoSuave"
  | "peligro"
  | "exito"
  | "info"
  | "aviso"
  | "rosa"
  | "sombra"
  | "esquema"
>;

export interface Paleta {
  id: string;
  nombre: string;
  descripcion: string;
  colores: ColoresPaleta;
}

/**
 * Para sumar una paleta: agregarla a esta lista. La primera es la de por defecto, y sus
 * valores tienen que coincidir con :root en src/index.css.
 * `secundario` y `texto` tienen que leerse bien sobre `fondo` y `superficie` (WCAG AA), y
 * `peligro` también sobre su propio tinte: las alertas y etiquetas usan `bg-peligro/10`.
 */
export const PALETAS: Paleta[] = [
  {
    id: "negro-violeta",
    nombre: "Negro y violeta",
    descripcion: "Fondo negro, violeta de acento y texto blanco.",
    colores: {
      primario: "#6c5ce7",
      primarioOscuro: "#4b3fd8",
      secundario: "#8b7bff",
      fondo: "#000000",
      superficie: "#0a0a0c",
      borde: "#1f1f24",
      texto: "#ffffff",
      textoSuave: "#a1a1aa",
      peligro: "#ef4444",
      exito: "#22c55e",
      info: "#818cf8",
      aviso: "#f59e0b",
      rosa: "#ec4899",
      sombra: "#000000",
      esquema: "dark",
    },
  },
  {
    id: "uva-neon",
    nombre: "Uva y neón",
    descripcion: "Morado profundo, rosa neón y texto blanco.",
    colores: {
      primario: "#ff4fae",
      primarioOscuro: "#7a3fe0",
      secundario: "#ff9ad6",
      fondo: "#1c1145",
      superficie: "#271a5c",
      borde: "#44318f",
      texto: "#ffffff",
      textoSuave: "#d3cbf5",
      peligro: "#ffb4a8",
      exito: "#22c55e",
      info: "#818cf8",
      aviso: "#f59e0b",
      rosa: "#ec4899",
      sombra: "#070218",
      esquema: "dark",
    },
  },
];
